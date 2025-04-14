// For any interactive functionality you want to add
document.addEventListener("DOMContentLoaded", function () {
  // You can add JavaScript functionality here
  console.log("Netflix Clone loaded");

  // Example: Change header background on scroll
  window.addEventListener("scroll", function () {
    const header = document.querySelector(".header");
    if (window.scrollY > 100) {
      header.style.background = "#141414";
    } else {
      header.style.background =
        "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7))";
    }
  });

  // Example: Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      });
    });
  });
});
