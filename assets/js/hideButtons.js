  document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('#header nav ul li a');
    const hideableButtons = document.querySelectorAll('.hideable');

    navLinks.forEach(link => {
      link.addEventListener('click', function () {
        hideableButtons.forEach(button => {
          button.style.display = 'none';
        });
      });
    });
  });
