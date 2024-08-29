  document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('a, img');
    const hideableButtons = document.querySelectorAll('.hideable');

    navLinks.forEach(link => {
      link.addEventListener('click', function () {
        hideableButtons.forEach(button => {
          button.style.display = 'none';
        });
      });
    });
  });
