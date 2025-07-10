using System.Windows;

namespace TextExpander
{
    public partial class App : Application
    {
        protected override void OnStartup(StartupEventArgs e)
        {
            base.OnStartup(e);

            // Initialize services and view models
            var templateManager = new TemplateManager();
            var searchService = new SearchService(templateManager);
            var clipboardService = new ClipboardService();
            var hotkeyService = new HotkeyService();

            var mainViewModel = new MainViewModel(templateManager, searchService, clipboardService, hotkeyService);

            // Create and show the main window
            var mainWindow = new MainWindow(mainViewModel);
            mainWindow.Show();
        }
    }
}