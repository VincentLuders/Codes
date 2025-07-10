import sys
import os
import traceback
from PyQt5.QtWidgets import (QApplication, QWidget, QLineEdit, QVBoxLayout, QSystemTrayIcon, QMenu, QAction, 
                             QPushButton, QListWidget, QDesktopWidget, QLabel, QHBoxLayout, QMessageBox,
                             QTextEdit, QFileDialog)
from PyQt5.QtCore import Qt, QObject, pyqtSignal
from PyQt5.QtGui import QIcon, QPalette, QColor
import keyboard
import ahk

class KeyPressHandler(QObject):
    keyPressed = pyqtSignal(str)

    def __init__(self):
        super().__init__()
        keyboard.on_press(self.on_key_press)

    def on_key_press(self, event):
        if event.name == 'esc':
            self.keyPressed.emit('esc')
        elif event.name == 'i' and keyboard.is_pressed('ctrl'):
            self.keyPressed.emit('ctrl+i')

class TextExpander(QWidget):
    def __init__(self):
        super().__init__()
        self.snippets = []
        self.initUI()
        self.key_handler = KeyPressHandler()
        self.key_handler.keyPressed.connect(self.handle_global_hotkey)
        
        self.ahk_path = self.find_ahk_executable()
        if self.ahk_path:
            print(f"Found AutoHotkey at: {self.ahk_path}")
            self.ahk = ahk.AHK(executable_path=self.ahk_path)
        else:
            print("AutoHotkey executable not found. Please check the installation.")
            sys.exit(1)
        
        self.load_snippets()
        self.update_ahk_script()

    def find_ahk_executable(self):
        common_paths = [
            r"C:\Program Files\AutoHotkey\AutoHotkey.exe",
            r"C:\Program Files\AutoHotkey\AutoHotkeyU64.exe",
            r"C:\Program Files (x86)\AutoHotkey\AutoHotkey.exe",
            r"C:\Program Files\AutoHotkey\v1.1.37.01\AutoHotkeyU64.exe",
        ]
        for path in common_paths:
            if os.path.exists(path):
                return path
        return None

    def initUI(self):
        self.setWindowTitle('Text Expander')
        self.setGeometry(100, 100, 1800, 1200)
        self.setWindowFlags(Qt.FramelessWindowHint | Qt.WindowStaysOnTopHint)

        # Center the window on the screen
        qtRectangle = self.frameGeometry()
        centerPoint = QDesktopWidget().availableGeometry().center()
        qtRectangle.moveCenter(centerPoint)
        self.move(qtRectangle.topLeft())

        layout = QVBoxLayout()

        # Search box
        self.search_box = QLineEdit(self)
        self.search_box.setPlaceholderText('Search snippets...')
        self.search_box.textChanged.connect(self.search_snippets)
        self.search_box.setStyleSheet("""
            QLineEdit {
                background-color: #333;
                color: #fff;
                border: 2px solid #555;
                border-radius: 10px;
                padding: 10px;
                font-size: 24px;
            }
        """)
        layout.addWidget(self.search_box)

        # Result list
        self.result_list = QListWidget(self)
        self.result_list.setStyleSheet("""
            QListWidget {
                background-color: #333;
                color: #fff;
                border: none;
                font-size: 20px;
            }
            QListWidget::item {
                padding: 10px;
            }
            QListWidget::item:selected {
                background-color: #555;
            }
        """)
        layout.addWidget(self.result_list)

        # New snippet section
        new_snippet_layout = QVBoxLayout()
        
        self.trigger_input = QLineEdit(self)
        self.trigger_input.setPlaceholderText("Enter trigger text")
        self.trigger_input.setStyleSheet("""
            QLineEdit {
                background-color: #333;
                color: #fff;
                border: 2px solid #555;
                border-radius: 10px;
                padding: 10px;
                font-size: 20px;
            }
        """)
        new_snippet_layout.addWidget(self.trigger_input)

        self.expansion_input = QTextEdit(self)
        self.expansion_input.setPlaceholderText("Enter expansion text")
        self.expansion_input.setStyleSheet("""
            QTextEdit {
                background-color: #333;
                color: #fff;
                border: 2px solid #555;
                border-radius: 10px;
                padding: 10px;
                font-size: 20px;
            }
        """)
        new_snippet_layout.addWidget(self.expansion_input)

        button_layout = QHBoxLayout()

        self.add_snippet_button = QPushButton("Add Snippet", self)
        self.add_snippet_button.clicked.connect(self.add_new_snippet)
        self.add_snippet_button.setStyleSheet("""
            QPushButton {
                background-color: #4CAF50;
                color: white;
                border: none;
                padding: 15px;
                font-size: 20px;
                border-radius: 8px;
            }
            QPushButton:hover {
                background-color: #45a049;
            }
        """)
        button_layout.addWidget(self.add_snippet_button)

        self.load_file_button = QPushButton("Load From File", self)
        self.load_file_button.clicked.connect(self.load_from_file)
        self.load_file_button.setStyleSheet("""
            QPushButton {
                background-color: #008CBA;
                color: white;
                border: none;
                padding: 15px;
                font-size: 20px;
                border-radius: 8px;
            }
            QPushButton:hover {
                background-color: #007B9A;
            }
        """)
        button_layout.addWidget(self.load_file_button)

        new_snippet_layout.addLayout(button_layout)
        layout.addLayout(new_snippet_layout)

        self.setLayout(layout)

        # Set dark mode palette
        dark_palette = QPalette()
        dark_palette.setColor(QPalette.Window, QColor(53, 53, 53))
        dark_palette.setColor(QPalette.WindowText, Qt.white)
        dark_palette.setColor(QPalette.Base, QColor(25, 25, 25))
        dark_palette.setColor(QPalette.AlternateBase, QColor(53, 53, 53))
        dark_palette.setColor(QPalette.ToolTipBase, Qt.white)
        dark_palette.setColor(QPalette.ToolTipText, Qt.white)
        dark_palette.setColor(QPalette.Text, Qt.white)
        dark_palette.setColor(QPalette.Button, QColor(53, 53, 53))
        dark_palette.setColor(QPalette.ButtonText, Qt.white)
        dark_palette.setColor(QPalette.BrightText, Qt.red)
        dark_palette.setColor(QPalette.Link, QColor(42, 130, 218))
        dark_palette.setColor(QPalette.Highlight, QColor(42, 130, 218))
        dark_palette.setColor(QPalette.HighlightedText, Qt.black)
        self.setPalette(dark_palette)

        # System tray
        self.tray_icon = QSystemTrayIcon(self)
        self.tray_icon.setIcon(QIcon('icon.png'))
        tray_menu = QMenu()
        exit_action = QAction("Exit", self)
        exit_action.triggered.connect(sys.exit)
        tray_menu.addAction(exit_action)
        self.tray_icon.setContextMenu(tray_menu)
        self.tray_icon.show()

    def handle_global_hotkey(self, key):
        if key == 'ctrl+i':
            self.show()
            self.activateWindow()
            self.search_box.setFocus()
        elif key == 'esc':
            self.hide()

    def load_snippets(self):
        if os.path.exists("snippets.txt"):
            with open("snippets.txt", "r", encoding='utf-8') as f:
                for line in f:
                    try:
                        trigger, expansion = line.strip().split(":", 1)
                        self.snippets.append({"trigger": trigger, "expansion": expansion})
                    except ValueError:
                        print(f"Invalid line in snippets.txt: {line}")
        else:
            self.snippets = [
                {"trigger": "btw", "expansion": "by the way"},
                {"trigger": "omw", "expansion": "on my way"},
                {"trigger": "lmk", "expansion": "let me know"},
            ]

    def search_snippets(self, text):
        try:
            self.result_list.clear()
            if text:
                results = [f"{s['trigger']}: {s['expansion']}" for s in self.snippets if text.lower() in s['trigger'].lower() or text.lower() in s['expansion'].lower()]
                self.result_list.addItems(results)
        except Exception as e:
            print(f"Error in search_snippets: {str(e)}")
            traceback.print_exc()

    def add_new_snippet(self):
        try:
            trigger = self.trigger_input.text()
            expansion = self.expansion_input.toPlainText()
            if trigger and expansion:
                self.snippets.append({"trigger": trigger, "expansion": expansion})
                self.update_ahk_script()
                self.save_snippets()
                self.trigger_input.clear()
                self.expansion_input.clear()
                QMessageBox.information(self, "Success", "New snippet added successfully!")
            else:
                QMessageBox.warning(self, "Error", "Both trigger and expansion are required.")
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Failed to add snippet: {str(e)}")
            traceback.print_exc()

    def load_from_file(self):
        try:
            file_path, _ = QFileDialog.getOpenFileName(self, "Select Text File", "", "Text Files (*.txt)")
            if file_path:
                with open(file_path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    self.expansion_input.setPlainText(content)
                QMessageBox.information(self, "Success", "File content loaded successfully!")
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Failed to load file: {str(e)}")
            traceback.print_exc()

    def update_ahk_script(self):
        try:
            script_content = "#NoEnv\nSetWorkingDir %A_ScriptDir%\n#Persistent\n#SingleInstance, Force\n\n"
            for snippet in self.snippets:
                script_content += f"::{snippet['trigger']}::\n"
                script_content += "{\n"
                script_content += f"clipboard := \"{snippet['expansion'].replace('\"', '\"\"')}\"\n"
                script_content += "SendInput, ^v\n"
                script_content += "return\n"
                script_content += "}\n\n"
            
            script_path = os.path.abspath("text_expander.ahk")
            with open(script_path, "w", encoding='utf-8') as f:
                f.write(script_content)
            
            # Stop the existing script if it's running
            self.ahk.run_script("ExitApp")
            
            # Run the updated script
            self.ahk.run_script(script_path)
        except Exception as e:
            print(f"Error in update_ahk_script: {str(e)}")
            traceback.print_exc()

    def save_snippets(self):
        try:
            with open("snippets.txt", "w", encoding='utf-8') as f:
                for snippet in self.snippets:
                    f.write(f"{snippet['trigger']}:{snippet['expansion']}\n")
        except Exception as e:
            print(f"Error in save_snippets: {str(e)}")
            traceback.print_exc()

    def mousePressEvent(self, event):
        if event.button() == Qt.LeftButton:
            if not self.geometry().contains(event.pos()):
                self.hide()

if __name__ == '__main__':
    app = QApplication(sys.argv)
    app.setStyle("Fusion")  # Use Fusion style for a more modern look
    te = TextExpander()
    sys.exit(app.exec_())