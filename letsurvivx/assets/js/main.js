document.addEventListener('DOMContentLoaded', function() {
  showPage('about');
});

document.querySelectorAll('.navbar a').forEach(link => {
    link.addEventListener('click', event => {
        event.preventDefault();
        const sectionId = link.getAttribute('href').substring(1);
        document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

function showPage(pageId) {
    var pages = document.querySelectorAll('.page');
    pages.forEach(function(page) {
      page.style.display = 'none';
    });
  
    var selectedPage = document.getElementById(pageId);
    if (selectedPage) {
      selectedPage.style.display = 'block';
    }
  }

function goToHomePage() {
  showPage('about');
}