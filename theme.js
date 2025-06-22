function applyTheme(){
    const theme = localStorage.getItem('theme');
    if(theme === 'dark'){
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

function toggleTheme(isDark){
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    applyTheme();
}

document.addEventListener('DOMContentLoaded', applyTheme);
