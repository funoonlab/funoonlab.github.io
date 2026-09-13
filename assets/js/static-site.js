(function () {
  document.addEventListener('submit', function (event) {
    const form = event.target;
    if (!form.matches('[data-static-form="contact"]')) return;
    event.preventDefault();
    let node = form.querySelector('.static-form-message');
    if (!node) {
      node = document.createElement('div');
      node.className = 'static-form-message';
      node.setAttribute('role', 'status');
      form.appendChild(node);
    }
    node.hidden = false;
    node.textContent = 'Thanks. This static version preserved the form UI; connect it to an email service or API endpoint before using it for live submissions.';
    form.reset();
  });
}());
