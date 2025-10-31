//interface header
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('header-container');
    fetch('header.html')
        .then(res => res.text())
        .then(html => container.innerHTML = html)
        .catch(err => console.error('Failed to load header: ', err));
});