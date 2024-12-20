
    function Scroll(name){
        const section = document.getElementById(name);
        section.scrollIntoView({ behavior: "smooth" });
    }

    const menu = document.getElementById('menu');

    function OpenMenu(){
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    }