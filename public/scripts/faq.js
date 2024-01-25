document.querySelectorAll('.faq-question').forEach(item => {
    item.addEventListener('click', event => {
        const answer = item.nextElementSibling;
        answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
        item.querySelector('.arrow').classList.toggle('up');
    });
});

window.addEventListener('scroll', function() {
    var header = document.querySelector('.header-top');
    var scrollPosition = window.scrollY;

    if (scrollPosition > 250) {
        header.classList.add('border-active');
    } else {
        header.classList.remove('border-active');
    }
});