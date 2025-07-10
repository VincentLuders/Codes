using System.Windows;
using System.Windows.Input;

namespace TextExpander
{
    public partial class MainWindow : Window
    {
        private readonly MainViewModel _viewModel;

        public MainWindow(MainViewModel viewModel)
        {
            InitializeComponent();
            _viewModel = viewModel;
            DataContext = _viewModel;

            // Register global hotkey (Ctrl+Space)
            _viewModel.HotkeyService.RegisterGlobalHotkey(this, Key.Space, ModifierKeys.Control, ShowWindow);
        }

        private void ShowWindow()
        {
            if (Visibility == Visibility.Visible)
            {
                Hide();
            }
            else
            {
                Show();
                Activate();
                SearchBox.Focus();
            }
        }

        protected override void OnClosed(EventArgs e)
        {
            base.OnClosed(e);
            _viewModel.HotkeyService.UnregisterGlobalHotkey();
        }
    }
}