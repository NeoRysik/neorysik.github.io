const menu=document.querySelector('.menu'),links=document.querySelector('.nav-links');
menu?.addEventListener('click',()=>{const open=links.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});
links?.addEventListener('click',()=>{links.classList.remove('open');menu?.setAttribute('aria-expanded','false')});
document.querySelector('#year').textContent=new Date().getFullYear();

const form=document.querySelector('[data-mailerlite-form]');
const status=form?.querySelector('.form-status');

window.ml_webform_success_43833331=function(){
  form?.reset();
  if(window.grecaptcha) window.grecaptcha.reset();
  if(status) status.textContent='Thank you! Please check your inbox for the first four chapters of In Memory. If the message does not arrive, check your spam folder or contact neorysik@gmail.com.';
};

if(form&&form.dataset.mailerliteReady!=='true'){
  form.addEventListener('submit',event=>{
    event.preventDefault();
    if(status) status.textContent='Newsletter signup is being connected. Please return shortly or email neorysik@gmail.com.';
  });
}

fetch('https://assets.mailerlite.com/jsonp/2512787/forms/193196965479056785/takel').catch(()=>{});
