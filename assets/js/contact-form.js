(function () {
  const ENDPOINT = 'https://script.google.com/macros/s/AKfycbyJlz8oA76StBjC2pTJCw81QGJ4tjuNA4a-LDZjHSvy13g4_IK7nss8-6GWnwvb85FI/exec';
  const SHEET = 'ContactUs';

  function field(form, name) {
    const el = form.querySelector('[name="form_fields[' + name + ']"]');
    return el ? el.value.trim() : '';
  }

  function showMessage(form, text, isError) {
    let node = form.querySelector('.static-form-message');
    if (!node) {
      node = document.createElement('div');
      node.className = 'static-form-message';
      node.setAttribute('role', 'status');
      form.appendChild(node);
    }
    node.classList.toggle('static-form-message--error', isError);
    node.textContent = text;
    node.hidden = false;
  }

  // Capture phase so this runs before Elementor Pro's form handler, which would
  // otherwise try to post to the (removed) WordPress admin-ajax endpoint.
  window.addEventListener('submit', async function (event) {
    const form = event.target;
    if (!form.matches('[data-contact-form]')) return;
    event.preventDefault();
    event.stopImmediatePropagation();

    const button = form.querySelector('button[type="submit"]');
    const data = {
      sheet: SHEET,
      name: field(form, 'name'),
      email: field(form, 'email'),
      phone: field(form, 'field_03625af'),
      company: field(form, 'field_0506ae5'),
      message: field(form, 'message'),
    };

    if (button) button.disabled = true;
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Submission failed');
      form.reset();
      showMessage(form, 'Thanks for reaching out. We will get back to you shortly.', false);
    } catch (error) {
      console.error(error);
      showMessage(form, 'Something went wrong sending your message. Please try again or email us directly.', true);
    } finally {
      if (button) button.disabled = false;
    }
  }, true);
}());
