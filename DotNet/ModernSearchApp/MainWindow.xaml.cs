using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;

namespace ModernSearchApp
{
    public partial class MainWindow : Window
    {
        public class Template
        {
            public string Shortcut { get; set; }
            public string Title { get; set; }
            public string Text { get; set; }
        }

        List<Template> Templates;

        public MainWindow()
        {
            InitializeComponent();

            // Initialize templates
            Templates = new List<Template>
            {
                new Template { Shortcut = "/g", Title = "Google Search", Text = "https://www.google.com/search?q={{query}}" },
                new Template { Shortcut = "/yt", Title = "YouTube Search", Text = "https://www.youtube.com/results?search_query={{query}}" },
                // Add more templates as needed
            };

            SearchBox.TextChanged += SearchBox_TextChanged;
            SearchBox.Focus();
        }

        private void SearchBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            string query = SearchBox.Text.ToLower();
            var results = Templates.Where(t =>
                t.Shortcut.ToLower().Contains(query) ||
                t.Title.ToLower().Contains(query) ||
                t.Text.ToLower().Contains(query)
            ).ToList();

            ResultsList.ItemsSource = results;
        }
    }
}
