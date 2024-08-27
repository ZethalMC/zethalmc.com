document.addEventListener('DOMContentLoaded', function() {
  showPage('about');
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

function toggleImage(imageId) {
  var image = document.getElementById(imageId);
  if (image.style.display === 'none' || image.style.display === '') {
    image.style.display = 'block';
  } else {
    image.style.display = 'none';
  }
}

function toggleGallery(galleryId) {
  var gallery = document.getElementById(galleryId);
  if (gallery.style.display === 'none' || gallery.style.display === '') {
    gallery.style.display = 'block';
  } else {
    gallery.style.display = 'none';
  }
}

function openImageModal(imageSource) {
  var modal = document.getElementById('imageModal');
  var modalImage = document.getElementById('modalImage');

  modalImage.src = imageSource;
  modal.style.display = 'block';
}

function closeImageModal() {
  var modal = document.getElementById('imageModal');
  modal.style.display = 'none';
}
