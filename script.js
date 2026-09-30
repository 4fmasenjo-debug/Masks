window.addEventListener("DOMContentLoaded", () => {
    const aviso = document.createElement("div");
    aviso.textContent = "SCRIPT.JS CARGADO CORRECTAMENTE";
    aviso.style.position = "fixed";
    aviso.style.top = "20px";
    aviso.style.left = "20px";
    aviso.style.zIndex = "9999";
    aviso.style.padding = "20px";
    aviso.style.background = "red";
    aviso.style.color = "white";
    aviso.style.fontSize = "24px";
    aviso.style.fontFamily = "Arial";
    document.body.appendChild(aviso);
    console.log("SCRIPT.JS CARGADO CORRECTAMENTE");
});
