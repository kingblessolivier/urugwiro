"""
Apply Material Design 3 redesign to all Urugwiro template files.
Run once, then delete this script.
"""
import os

BASE = os.path.dirname(os.path.abspath(__file__))
TPL = os.path.join(BASE, 'templates', 'home')

# ─── base.html ───────────────────────────────────────────────────────────────
files = {}

files['base.html'] = r'''{% load static %}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Urugwiro Properties | {% block title %}{% endblock %}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.0/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="{% static 'css/m3-theme.css' %}">
    <style>
    .navbar-m3{background:var(--md-sys-color-surface);box-shadow:var(--md-sys-elevation-2);padding:8px 16px;transition:all 300ms var(--md-sys-motion-easing-standard);position:fixed;top:0;left:0;right:0;z-index:1000}
    .navbar-m3.scrolled{background:var(--md-sys-color-surface-container);box-shadow:var(--md-sys-elevation-3)}
    .navbar-m3 .navbar-brand{font:500 1.5rem/1.5 'Inter',sans-serif;color:var(--md-sys-color-on-surface)!important;display:flex;align-items:center;gap:10px;text-decoration:none}
    .navbar-m3 .navbar-brand img{border-radius:var(--md-sys-shape-corner-medium);transition:transform 300ms var(--md-sys-motion-easing-emphasized)}
    .navbar-m3 .navbar-brand:hover img{transform:scale(1.05)}
    .navbar-m3 .nav-link{color:var(--md-sys-color-on-surface-variant)!important;font:var(--md-sys-typescale-label-large);padding:8px 16px!important;margin:0 2px;border-radius:var(--md-sys-shape-corner-full);transition:all 200ms var(--md-sys-motion-easing-standard);display:flex;align-items:center;gap:8px;position:relative}
    .navbar-m3 .nav-link:hover{color:var(--md-sys-color-on-surface)!important;background:var(--md-sys-color-surface-container-high)}
    .navbar-m3 .nav-link.active{color:var(--md-sys-color-on-primary-container)!important;background:var(--md-sys-color-primary-container)}
    .navbar-m3 .nav-link.active .material-symbols-outlined{font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 24}
    .navbar-m3 .nav-link .material-symbols-outlined{font-size:20px}
    .navbar-m3 .navbar-toggler{border:none;padding:8px;border-radius:var(--md-sys-shape-corner-full);color:var(--md-sys-color-on-surface)}
    .navbar-m3 .navbar-toggler:focus{box-shadow:none}
    .navbar-m3 .navbar-toggler:hover{background:var(--md-sys-color-surface-container-high)}
    .navbar-m3 .navbar-toggler-icon{background-image:url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='%23191c19' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e")}
    .navbar-m3 .dropdown-menu{border:none;border-radius:var(--md-sys-shape-corner-medium);box-shadow:var(--md-sys-elevation-2);background:var(--md-sys-color-surface-container);padding:4px 0;min-width:200px}
    .navbar-m3 .dropdown-item{font:var(--md-sys-typescale-body-large);padding:12px 16px;color:var(--md-sys-color-on-surface);display:flex;align-items:center;gap:12px;transition:background 150ms}
    .navbar-m3 .dropdown-item:hover{background:var(--md-sys-color-surface-container-high)}
    .navbar-m3 .dropdown-item .material-symbols-outlined{font-size:20px;color:var(--md-sys-color-on-surface-variant)}
    .btn-m3-login{display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 24px;background:transparent;color:var(--md-sys-color-primary);border:1px solid var(--md-sys-color-outline);border-radius:var(--md-sys-shape-corner-full);font:var(--md-sys-typescale-label-large);text-decoration:none;transition:all 200ms}
    .btn-m3-login:hover{background:rgba(40,167,69,.08);color:var(--md-sys-color-primary)}
    .btn-m3-signup{display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 24px;background:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary);border:none;border-radius:var(--md-sys-shape-corner-full);font:var(--md-sys-typescale-label-large);text-decoration:none;margin-left:8px;transition:all 200ms}
    .btn-m3-signup:hover{box-shadow:var(--md-sys-elevation-1);color:var(--md-sys-color-on-primary)}
    .user-chip{display:flex;align-items:center;gap:10px;padding:4px 16px 4px 4px;border-radius:var(--md-sys-shape-corner-full);color:var(--md-sys-color-on-surface);text-decoration:none;transition:background 150ms}
    .user-chip:hover{background:var(--md-sys-color-surface-container-high);color:var(--md-sys-color-on-surface)}
    .user-chip-avatar{width:36px;height:36px;border-radius:var(--md-sys-shape-corner-full);background:var(--md-sys-color-primary-container);color:var(--md-sys-color-on-primary-container);display:flex;align-items:center;justify-content:center}
    .user-chip-name{font:var(--md-sys-typescale-label-large)}
    .main-content{min-height:calc(100vh - 200px)}
    .footer-m3{background:var(--md-sys-color-surface-container);color:var(--md-sys-color-on-surface);padding:48px 0 24px;margin-top:0}
    .footer-m3 .footer-section h5{font:var(--md-sys-typescale-title-medium);color:var(--md-sys-color-on-surface);margin-bottom:16px;display:inline-flex;align-items:center;gap:8px}
    .footer-m3 .footer-section h5::after{content:none}
    .footer-m3 .footer-section h5 .material-symbols-outlined{font-size:20px;color:var(--md-sys-color-primary)}
    .footer-m3 .footer-section p{font:var(--md-sys-typescale-body-medium);color:var(--md-sys-color-on-surface-variant)}
    .footer-m3 .footer-links{list-style:none;padding:0;margin:0}
    .footer-m3 .footer-links li{margin-bottom:4px}
    .footer-m3 .footer-links a{font:var(--md-sys-typescale-body-medium);color:var(--md-sys-color-on-surface-variant);text-decoration:none;display:inline-flex;align-items:center;gap:4px;padding:6px 12px;border-radius:var(--md-sys-shape-corner-full);transition:all 150ms}
    .footer-m3 .footer-links a:hover{background:var(--md-sys-color-surface-container-high);color:var(--md-sys-color-primary)}
    .social-icons-m3{display:flex;gap:8px;flex-wrap:wrap}
    .social-icons-m3 a{width:40px;height:40px;border-radius:var(--md-sys-shape-corner-full);background:var(--md-sys-color-surface-container-high);color:var(--md-sys-color-on-surface-variant);display:flex;align-items:center;justify-content:center;text-decoration:none;transition:all 200ms}
    .social-icons-m3 a:hover{background:var(--md-sys-color-primary-container);color:var(--md-sys-color-on-primary-container);transform:translateY(-2px)}
    .footer-bottom-m3{border-top:1px solid var(--md-sys-color-outline-variant);padding-top:20px;margin-top:32px;text-align:center}
    .footer-bottom-m3 p{font:var(--md-sys-typescale-body-small);color:var(--md-sys-color-on-surface-variant);margin:0}
    @media(max-width:992px){.navbar-m3 .navbar-collapse{padding:16px 0}.navbar-m3 .nav-link{margin:2px 0}.btn-m3-login,.btn-m3-signup{margin:8px 4px 0 0}.user-chip{margin-top:12px}}
    @media(max-width:768px){.navbar-m3 .navbar-brand{font-size:1.25rem}.footer-m3 .footer-section{margin-bottom:24px;text-align:center}.social-icons-m3{justify-content:center}}
    .fade-in{animation:m3FadeIn 500ms cubic-bezier(.05,.7,.1,1)}
    @keyframes m3FadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    </style>
    {% block extra_css %}{% endblock %}
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-m3">
        <div class="container">
            <a class="navbar-brand" href="{% url 'index' %}">
                <img src="{% static 'images/Urugwiro_logo.jpeg' %}" alt="Urugwiro" width="40" height="40">Urugwiro
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"><span class="navbar-toggler-icon"></span></button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav mx-auto">
                    <li class="nav-item"><a class="nav-link {% if request.resolver_match.url_name == 'index' %}active{% endif %}" href="{% url 'index' %}"><span class="material-symbols-outlined">home</span>Home</a></li>
                    <li class="nav-item"><a class="nav-link {% if request.resolver_match.url_name == 'about' %}active{% endif %}" href="{% url 'about' %}"><span class="material-symbols-outlined">info</span>About</a></li>
                    <li class="nav-item"><a class="nav-link {% if request.resolver_match.url_name == 'contact' %}active{% endif %}" href="{% url 'contact' %}"><span class="material-symbols-outlined">call</span>Contact</a></li>
                    <li class="nav-item"><a class="nav-link {% if request.resolver_match.url_name == 'updates' %}active{% endif %}" href="{% url 'updates' %}"><span class="material-symbols-outlined">notifications</span>Updates</a></li>
                    <li class="nav-item"><a class="nav-link {% if request.resolver_match.url_name == 'property_list' %}active{% endif %}" href="{% url 'property_list' %}"><span class="material-symbols-outlined">apartment</span>Properties</a></li>
                    {% if user.is_authenticated and user.role == "Admin" %}
                    <li class="nav-item"><a class="nav-link" href="{% url 'admin_dashboard' %}"><span class="material-symbols-outlined">dashboard</span>Admin</a></li>
                    {% elif user.is_authenticated and user.role == 'Owner' %}
                        {% if owner_user %}
                        <li class="nav-item"><a class="nav-link" href="{% url 'owner_dashboard' user.id %}"><span class="material-symbols-outlined">dashboard</span>Dashboard</a></li>
                        {% else %}
                        <li class="nav-item"><a class="nav-link" href="{% url 'create_owner_profile' user.id %}"><span class="material-symbols-outlined">person_add</span>Register</a></li>
                        {% endif %}
                    {% elif user.is_authenticated and user.role == "Tenant" %}
                        {% if tenant_user %}
                        <li class="nav-item"><a class="nav-link" href="{% url 'tenant_dashboard' user.id %}"><span class="material-symbols-outlined">dashboard</span>Dashboard</a></li>
                        {% else %}
                        <li class="nav-item"><a class="nav-link" href="{% url 'new_tenant' user.id %}"><span class="material-symbols-outlined">person_add</span>Register</a></li>
                        {% endif %}
                    {% endif %}
                </ul>
                <div class="d-flex align-items-center">
                    {% if user.is_authenticated %}
                    <div class="dropdown">
                        <a class="user-chip dropdown-toggle" href="#" role="button" id="userDropdown" data-bs-toggle="dropdown">
                            <div class="user-chip-avatar"><span class="material-symbols-outlined" style="font-size:20px">person</span></div>
                            <span class="user-chip-name">{{ user.username }}</span>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end shadow">
                            <li><a class="dropdown-item" href="#"><span class="material-symbols-outlined">account_circle</span>View Profile</a></li>
                            <li><hr class="dropdown-divider" style="margin:4px 0;border-color:var(--md-sys-color-outline-variant)"></li>
                            <li><a class="dropdown-item" href="{% url 'user_logout' %}"><span class="material-symbols-outlined">logout</span>Logout</a></li>
                        </ul>
                    </div>
                    {% else %}
                    <a class="btn-m3-login" href="{% url 'user_login' %}"><span class="material-symbols-outlined" style="font-size:18px">login</span>Login</a>
                    <a class="btn-m3-signup" href="{% url 'register' %}"><span class="material-symbols-outlined" style="font-size:18px">person_add</span>Sign Up</a>
                    {% endif %}
                </div>
            </div>
        </div>
    </nav>
    <main class="main-content fade-in">{% block content %}{% endblock %}</main>
    <footer class="footer-m3">
        <div class="container">
            <div class="row">
                <div class="col-lg-4 col-md-6 footer-section">
                    <h5><span class="material-symbols-outlined">mail</span>Contact Us</h5>
                    <p>For inquiries, please reach out to us:</p>
                    <p><span class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">email</span> <a href="mailto:support@urugwiro.com" style="color:var(--md-sys-color-primary);text-decoration:none">support@urugwiro.com</a></p>
                    <p><span class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">phone</span> <a href="tel:+250788123456" style="color:var(--md-sys-color-on-surface-variant);text-decoration:none">+250 788 123 456</a></p>
                    <p><span class="material-symbols-outlined" style="font-size:18px;vertical-align:middle">location_on</span> Kigali, Rwanda</p>
                </div>
                <div class="col-lg-4 col-md-6 footer-section">
                    <h5><span class="material-symbols-outlined">link</span>Quick Links</h5>
                    <ul class="footer-links">
                        <li><a href="{% url 'index' %}#services">What We Do</a></li>
                        <li><a href="{% url 'index' %}#featured">Featured Properties</a></li>
                        <li><a href="{% url 'index' %}#testimonials">Testimonials</a></li>
                        <li><a href="{% url 'about' %}">About Us</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                        <li><a href="#">Terms of Service</a></li>
                    </ul>
                </div>
                <div class="col-lg-4 col-md-12 footer-section">
                    <h5><span class="material-symbols-outlined">share</span>Follow Us</h5>
                    <p>Stay connected with us on social media</p>
                    <div class="social-icons-m3 mt-3">
                        <a href="https://facebook.com" target="_blank"><i class="bi bi-facebook"></i></a>
                        <a href="https://twitter.com" target="_blank"><i class="bi bi-twitter-x"></i></a>
                        <a href="https://linkedin.com" target="_blank"><i class="bi bi-linkedin"></i></a>
                        <a href="https://instagram.com" target="_blank"><i class="bi bi-instagram"></i></a>
                        <a href="https://github.com" target="_blank"><i class="bi bi-github"></i></a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom-m3"><p>&copy; 2025 Urugwiro Properties. All rights reserved.</p></div>
        </div>
    </footer>
<!--Start of Tawk.to Script-->
<script type="text/javascript">
var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];s1.async=true;s1.src='https://embed.tawk.to/69a609c92f01051c35610a97/1jio9cfl9';s1.charset='UTF-8';s1.setAttribute('crossorigin','*');s0.parentNode.insertBefore(s1,s0);})();
</script>
<!--End of Tawk.to Script-->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js"></script>
    <script>
    $(window).scroll(function(){$('.navbar-m3').toggleClass('scrolled',$(window).scrollTop()>50)});
    $(document).ready(function(){
        var tt=[].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));tt.map(function(e){return new bootstrap.Tooltip(e)});
        var reveals=document.querySelectorAll('.md-reveal');
        if(reveals.length){var obs=new IntersectionObserver(function(e){e.forEach(function(en){if(en.isIntersecting)en.target.classList.add('visible')})},{threshold:.1});reveals.forEach(function(el){obs.observe(el)})}
    });
    </script>
    {% block extra_js %}{% endblock %}
</body>
</html>
'''

# ─── home.html ───────────────────────────────────────────────────────────────
files['home.html'] = r'''{% extends 'home/base.html' %}
{% load static %}
{% block title %}Home - Urugwiro Properties{% endblock %}
{% block content %}
<style>
    .m3-hero{position:relative;min-height:100vh;display:flex;align-items:center;background:linear-gradient(160deg,#1a2a1a 0%,#1e3e2e 40%,#0d4a25 100%);overflow:hidden}
    .m3-hero::before{content:'';position:absolute;top:-120px;right:-120px;width:500px;height:500px;background:radial-gradient(circle,rgba(40,167,69,.18) 0%,transparent 70%);border-radius:50%;animation:m3f 8s ease-in-out infinite}
    .m3-hero::after{content:'';position:absolute;bottom:-80px;left:-80px;width:400px;height:400px;background:radial-gradient(circle,rgba(32,201,151,.12) 0%,transparent 70%);border-radius:50%;animation:m3f 10s ease-in-out infinite reverse}
    @keyframes m3f{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-30px) scale(1.05)}}
    .m3-hero .shape{position:absolute;border-radius:50%;opacity:.06;background:#fff}
    .s1{width:200px;height:200px;top:15%;left:5%;animation:m3f 12s ease-in-out infinite}
    .s2{width:120px;height:120px;top:60%;right:10%;animation:m3f 9s ease-in-out infinite 2s}
    .s3{width:80px;height:80px;top:30%;right:25%;animation:m3f 7s ease-in-out infinite 1s}
    .m3-hero-inner{position:relative;z-index:2}
    .m3-hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(184,245,176,.12);color:var(--md-sys-color-inverse-primary);padding:8px 20px;border-radius:var(--md-sys-shape-corner-full);font:var(--md-sys-typescale-label-medium);letter-spacing:.5px;text-transform:uppercase;border:1px solid rgba(184,245,176,.2);margin-bottom:20px}
    .m3-hero-title{font:500 3.2rem/1.15 'Inter',sans-serif;color:#fff;margin-bottom:20px}
    .m3-gradient{background:linear-gradient(135deg,var(--md-sys-color-inverse-primary),var(--md-sys-color-tertiary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
    .m3-hero-sub{color:rgba(255,255,255,.65);font:var(--md-sys-typescale-body-large);max-width:520px;margin-bottom:36px;line-height:1.7}
    .m3-hero-btns{display:flex;gap:14px;flex-wrap:wrap}
    .m3-hv{position:relative;display:flex;justify-content:center;align-items:center}
    .m3-hcs{position:relative;width:100%;max-width:420px}
    .m3-hc{background:rgba(255,255,255,.07);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.1);border-radius:var(--md-sys-shape-corner-extra-large);padding:24px;color:#fff}
    .m3-hc-main{position:relative;z-index:3}
    .m3-hc-b1{position:absolute;top:20px;left:20px;right:-20px;bottom:-20px;z-index:1;opacity:.5;transform:rotate(3deg)}
    .m3-hc-b2{position:absolute;top:40px;left:40px;right:-40px;bottom:-40px;z-index:0;opacity:.3;transform:rotate(6deg)}
    .m3-hc-price{font:var(--md-sys-typescale-headline-large);margin-bottom:4px}
    .m3-hc-lbl{font:var(--md-sys-typescale-body-small);color:rgba(255,255,255,.5);margin-bottom:16px}
    .m3-hc-row{display:flex;gap:16px;margin-top:12px}
    .m3-hc-st{flex:1;background:rgba(255,255,255,.06);border-radius:var(--md-sys-shape-corner-medium);padding:12px;text-align:center}
    .m3-hc-sv{font:var(--md-sys-typescale-title-medium)}.m3-hc-sl{font:var(--md-sys-typescale-label-small);color:rgba(255,255,255,.5)}

    .m3-stats{background:var(--md-sys-color-surface);padding:0;position:relative;z-index:5}
    .m3-stats-inner{display:grid;grid-template-columns:repeat(4,1fr);background:var(--md-sys-color-surface-container-lowest);border-radius:var(--md-sys-shape-corner-extra-large);box-shadow:var(--md-sys-elevation-3);margin-top:-50px;overflow:hidden}
    .m3-stat{padding:36px 24px;text-align:center;position:relative;transition:all 300ms var(--md-sys-motion-easing-standard)}
    .m3-stat:not(:last-child)::after{content:'';position:absolute;right:0;top:20%;height:60%;width:1px;background:var(--md-sys-color-outline-variant)}
    .m3-stat:hover{background:var(--md-sys-color-primary-container)}
    .m3-stat-icon{width:48px;height:48px;border-radius:var(--md-sys-shape-corner-medium);background:var(--md-sys-color-primary-container);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;color:var(--md-sys-color-on-primary-container)}
    .m3-stat:hover .m3-stat-icon{background:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary)}
    .m3-stat-val{font:500 2.2rem/1 'Inter',sans-serif;color:var(--md-sys-color-on-surface);margin-bottom:6px}
    .m3-stat-lbl{font:var(--md-sys-typescale-label-medium);color:var(--md-sys-color-on-surface-variant)}

    .m3-sec{padding:100px 0}.m3-sec-s{background:var(--md-sys-color-surface)}.m3-sec-c{background:var(--md-sys-color-surface-container)}
    .m3-sh{text-align:center;margin-bottom:56px}
    .m3-tag{display:inline-flex;align-items:center;gap:8px;background:var(--md-sys-color-primary-container);color:var(--md-sys-color-on-primary-container);padding:6px 16px;border-radius:var(--md-sys-shape-corner-full);font:var(--md-sys-typescale-label-medium);letter-spacing:.5px;text-transform:uppercase;margin-bottom:14px}
    .m3-tag .material-symbols-outlined{font-size:16px}
    .m3-stitle{font:var(--md-sys-typescale-headline-large);color:var(--md-sys-color-on-surface);margin-bottom:14px}
    .m3-ssub{color:var(--md-sys-color-on-surface-variant);font:var(--md-sys-typescale-body-large);max-width:560px;margin:0 auto;line-height:1.7}

    .m3-svc{background:var(--md-sys-color-surface-container-low);border-radius:var(--md-sys-shape-corner-large);padding:32px 24px;text-align:center;border:1px solid var(--md-sys-color-outline-variant);transition:all 300ms var(--md-sys-motion-easing-emphasized);height:100%;overflow:hidden}
    .m3-svc:hover{transform:translateY(-4px);box-shadow:var(--md-sys-elevation-2);border-color:transparent;background:var(--md-sys-color-surface-container-lowest)}
    .m3-svc-icon{width:64px;height:64px;border-radius:var(--md-sys-shape-corner-large);background:var(--md-sys-color-primary-container);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;color:var(--md-sys-color-on-primary-container);transition:all 300ms}
    .m3-svc-icon .material-symbols-outlined{font-size:28px}
    .m3-svc:hover .m3-svc-icon{background:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary);transform:scale(1.1)}
    .m3-svc h3{font:var(--md-sys-typescale-title-medium);color:var(--md-sys-color-on-surface);margin-bottom:10px}
    .m3-svc p{font:var(--md-sys-typescale-body-medium);color:var(--md-sys-color-on-surface-variant);margin:0;line-height:1.65}

    .m3-pc{background:var(--md-sys-color-surface-container-lowest);border-radius:var(--md-sys-shape-corner-large);overflow:hidden;border:1px solid var(--md-sys-color-outline-variant);transition:all 300ms var(--md-sys-motion-easing-emphasized);height:100%;display:flex;flex-direction:column}
    .m3-pc:hover{transform:translateY(-4px);box-shadow:var(--md-sys-elevation-2);border-color:transparent}
    .m3-pc-img{position:relative;height:240px;overflow:hidden}
    .m3-pc-img img{width:100%;height:100%;object-fit:cover;transition:transform .5s}
    .m3-pc:hover .m3-pc-img img{transform:scale(1.05)}
    .m3-pc-img::after{content:'';position:absolute;bottom:0;left:0;right:0;height:80px;background:linear-gradient(transparent,rgba(0,0,0,.4));pointer-events:none}
    .m3-pc-badge{position:absolute;top:14px;left:14px;z-index:2;background:var(--md-sys-color-surface-container-lowest);padding:4px 14px;border-radius:var(--md-sys-shape-corner-full);font:var(--md-sys-typescale-label-small);text-transform:uppercase;color:var(--md-sys-color-on-surface);box-shadow:var(--md-sys-elevation-1)}
    .m3-pc-price{position:absolute;bottom:14px;left:14px;z-index:2;font:var(--md-sys-typescale-title-large);color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.3)}
    .m3-pc-price small{font:var(--md-sys-typescale-label-small);opacity:.85}
    .m3-pc-body{padding:20px;flex:1;display:flex;flex-direction:column}
    .m3-pc-body h5{font:var(--md-sys-typescale-title-medium);color:var(--md-sys-color-on-surface);margin-bottom:8px;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
    .m3-pc-loc{display:flex;align-items:center;gap:6px;color:var(--md-sys-color-on-surface-variant);font:var(--md-sys-typescale-body-small);margin-bottom:16px}
    .m3-pc-loc .material-symbols-outlined{font-size:16px;color:var(--md-sys-color-primary)}
    .m3-pc-feats{display:flex;padding:14px 0;border-top:1px solid var(--md-sys-color-outline-variant);border-bottom:1px solid var(--md-sys-color-outline-variant);margin-bottom:16px}
    .m3-pc-f{flex:1;text-align:center;position:relative}
    .m3-pc-f:not(:last-child)::after{content:'';position:absolute;right:0;top:4px;bottom:4px;width:1px;background:var(--md-sys-color-outline-variant)}
    .m3-pc-f .material-symbols-outlined{color:var(--md-sys-color-primary);font-size:20px;margin-bottom:4px;display:block}
    .m3-pc-fv{font:var(--md-sys-typescale-label-large);color:var(--md-sys-color-on-surface)}
    .m3-pc-fl{font:var(--md-sys-typescale-label-small);color:var(--md-sys-color-on-surface-variant)}
    .m3-pc-desc{font:var(--md-sys-typescale-body-medium);color:var(--md-sys-color-on-surface-variant);line-height:1.6;flex:1;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:16px}
    .m3-pc-ft{padding:0 20px 20px}
    .m3-btn-view{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:12px;background:var(--md-sys-color-secondary-container);color:var(--md-sys-color-on-secondary-container);border:none;border-radius:var(--md-sys-shape-corner-full);font:var(--md-sys-typescale-label-large);transition:all 300ms;text-decoration:none;cursor:pointer}
    .m3-btn-view:hover{background:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary);box-shadow:var(--md-sys-elevation-1)}

    .m3-tc{background:var(--md-sys-color-surface-container-low);border-radius:var(--md-sys-shape-corner-large);padding:28px;border:1px solid var(--md-sys-color-outline-variant);transition:all 300ms;height:100%;position:relative}
    .m3-tc::before{content:'\201C';position:absolute;top:12px;right:20px;font-size:4rem;color:var(--md-sys-color-primary-container);font-family:Georgia,serif;line-height:1}
    .m3-tc:hover{transform:translateY(-4px);box-shadow:var(--md-sys-elevation-2);border-color:transparent}
    .m3-tc-stars{margin-bottom:16px}
    .m3-tc-txt{font:var(--md-sys-typescale-body-medium);color:var(--md-sys-color-on-surface-variant);line-height:1.7;font-style:italic;margin-bottom:24px}
    .m3-tc-author{display:flex;align-items:center;gap:14px}
    .m3-tc-avatar{width:48px;height:48px;border-radius:var(--md-sys-shape-corner-full);object-fit:cover;border:3px solid var(--md-sys-color-primary-container)}
    .m3-tc-name{font:var(--md-sys-typescale-title-small);color:var(--md-sys-color-on-surface);margin-bottom:2px}
    .m3-tc-role{font:var(--md-sys-typescale-label-small);color:var(--md-sys-color-primary)}

    .m3-nc{background:var(--md-sys-color-surface-container-lowest);border-radius:var(--md-sys-shape-corner-large);overflow:hidden;border:1px solid var(--md-sys-color-outline-variant);transition:all 300ms;height:100%;display:flex;flex-direction:column}
    .m3-nc:hover{transform:translateY(-4px);box-shadow:var(--md-sys-elevation-2);border-color:transparent}
    .m3-nc-img{height:200px;overflow:hidden;position:relative}
    .m3-nc-img img{width:100%;height:100%;object-fit:cover;transition:transform .5s}
    .m3-nc:hover .m3-nc-img img{transform:scale(1.05)}
    .m3-nc-chip{position:absolute;top:14px;left:14px;background:var(--md-sys-color-surface-container-lowest);padding:4px 14px;border-radius:var(--md-sys-shape-corner-full);font:var(--md-sys-typescale-label-small);color:var(--md-sys-color-primary);box-shadow:var(--md-sys-elevation-1);display:inline-flex;align-items:center;gap:4px}
    .m3-nc-body{padding:20px;flex:1;display:flex;flex-direction:column}
    .m3-nc-body h5{font:var(--md-sys-typescale-title-medium);color:var(--md-sys-color-on-surface);margin-bottom:10px}
    .m3-nc-body p{font:var(--md-sys-typescale-body-medium);color:var(--md-sys-color-on-surface-variant);line-height:1.65;flex:1;margin:0}

    .m3-cta{padding:100px 0;position:relative;overflow:hidden;background:linear-gradient(135deg,var(--md-sys-color-inverse-surface) 0%,#0d4a25 100%)}
    .m3-cta::before{content:'';position:absolute;inset:0;background:url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><circle cx="40" cy="40" r="1.5" fill="rgba(255,255,255,.04)"/></svg>');background-size:40px 40px}
    .m3-cta-inner{position:relative;z-index:2;text-align:center}
    .m3-cta h2{font:500 2.2rem/1.3 'Inter',sans-serif;color:#fff;margin-bottom:16px}
    .m3-cta p{color:rgba(255,255,255,.7);font:var(--md-sys-typescale-body-large);max-width:560px;margin:0 auto 36px;line-height:1.7}
    .m3-cta-btns{display:flex;justify-content:center;gap:14px;flex-wrap:wrap}
    .m3-btn-w{display:inline-flex;align-items:center;gap:10px;height:48px;padding:0 28px;background:var(--md-sys-color-surface-container-lowest);color:var(--md-sys-color-on-surface);border:none;border-radius:var(--md-sys-shape-corner-full);font:var(--md-sys-typescale-label-large);text-decoration:none;box-shadow:var(--md-sys-elevation-1);transition:all 300ms}
    .m3-btn-w:hover{box-shadow:var(--md-sys-elevation-3);transform:translateY(-2px);color:var(--md-sys-color-on-surface)}
    .m3-btn-o{display:inline-flex;align-items:center;gap:10px;height:48px;padding:0 28px;background:transparent;color:#fff;border:1px solid rgba(255,255,255,.3);border-radius:var(--md-sys-shape-corner-full);font:var(--md-sys-typescale-label-large);text-decoration:none;transition:all 300ms}
    .m3-btn-o:hover{border-color:#fff;background:rgba(255,255,255,.08);transform:translateY(-2px);color:#fff}

    @media(max-width:992px){.m3-hero-title{font-size:2.6rem}.m3-stats-inner{grid-template-columns:repeat(2,1fr)}.m3-stat:nth-child(2)::after{display:none}.m3-hv{margin-top:40px}}
    @media(max-width:768px){.m3-hero-title{font-size:2.2rem}.m3-stats-inner{margin-top:-30px}.m3-stat-val{font-size:1.8rem}.m3-sec{padding:70px 0}.m3-stitle{font-size:1.5rem}.m3-cta h2{font-size:1.8rem}}
    @media(max-width:576px){.m3-hero-title{font-size:1.8rem}.m3-stats-inner{grid-template-columns:1fr 1fr}.m3-hero-btns,.m3-cta-btns{flex-direction:column;align-items:center}}
</style>

<section class="m3-hero">
    <div class="shape s1"></div><div class="shape s2"></div><div class="shape s3"></div>
    <div class="container">
        <div class="row align-items-center">
            <div class="col-lg-6">
                <div class="m3-hero-inner">
                    <div class="m3-hero-badge"><span class="material-symbols-outlined" style="font-size:16px">workspace_premium</span>#1 Property Platform in Rwanda</div>
                    <h1 class="m3-hero-title">Smart Property<br>Management<br><span class="m3-gradient">Made Simple.</span></h1>
                    <p class="m3-hero-sub">Streamline your real estate journey with Urugwiro — the all-in-one platform for property owners, tenants, and professionals.</p>
                    <div class="m3-hero-btns">
                        <a href="{% url 'property_list' %}" class="md-btn-filled" style="height:48px;padding:0 28px;font-size:.95rem;box-shadow:var(--md-sys-elevation-2)"><span class="material-symbols-outlined" style="font-size:20px">search</span>Browse Properties</a>
                        <a href="#services" class="m3-btn-o"><span class="material-symbols-outlined" style="font-size:20px">play_circle</span>Learn More</a>
                    </div>
                </div>
            </div>
            <div class="col-lg-6 d-none d-lg-block">
                <div class="m3-hv">
                    <div class="m3-hcs">
                        <div class="m3-hc m3-hc-b2"></div><div class="m3-hc m3-hc-b1"></div>
                        <div class="m3-hc m3-hc-main">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
                                <div><div class="m3-hc-price">{{ total_properties|default:"150" }}+</div><div class="m3-hc-lbl">Listed Properties</div></div>
                                <div style="width:56px;height:56px;border-radius:var(--md-sys-shape-corner-large);background:rgba(184,245,176,.15);display:flex;align-items:center;justify-content:center;color:var(--md-sys-color-inverse-primary)"><span class="material-symbols-outlined">apartment</span></div>
                            </div>
                            <div class="m3-hc-row">
                                <div class="m3-hc-st"><div class="m3-hc-sv">{{ total_owners|default:"50" }}+</div><div class="m3-hc-sl">Owners</div></div>
                                <div class="m3-hc-st"><div class="m3-hc-sv">{{ total_tenants|default:"200" }}+</div><div class="m3-hc-sl">Tenants</div></div>
                                <div class="m3-hc-st"><div class="m3-hc-sv">4.8</div><div class="m3-hc-sl">Rating</div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<section class="m3-stats"><div class="container"><div class="m3-stats-inner">
    <div class="m3-stat md-reveal"><div class="m3-stat-icon"><span class="material-symbols-outlined">apartment</span></div><div class="m3-stat-val" data-count="1500">0</div><div class="m3-stat-lbl">Properties Managed</div></div>
    <div class="m3-stat md-reveal"><div class="m3-stat-icon"><span class="material-symbols-outlined">groups</span></div><div class="m3-stat-val" data-count="500">0</div><div class="m3-stat-lbl">Happy Clients</div></div>
    <div class="m3-stat md-reveal"><div class="m3-stat-icon"><span class="material-symbols-outlined">handshake</span></div><div class="m3-stat-val" data-count="50">0</div><div class="m3-stat-lbl">Real Estate Partners</div></div>
    <div class="m3-stat md-reveal"><div class="m3-stat-icon"><span class="material-symbols-outlined">military_tech</span></div><div class="m3-stat-val" data-count="3">0</div><div class="m3-stat-lbl">Years of Excellence</div></div>
</div></div></section>

<section id="services" class="m3-sec m3-sec-c"><div class="container">
    <div class="m3-sh"><div class="m3-tag"><span class="material-symbols-outlined">settings</span>Our Services</div><h2 class="m3-stitle">What We Do</h2><p class="m3-ssub">We revolutionize property management with innovative solutions for owners, tenants, and real estate professionals.</p></div>
    <div class="row g-4">
        <div class="col-lg-4 col-md-6"><div class="m3-svc md-reveal"><div class="m3-svc-icon"><span class="material-symbols-outlined">home</span></div><h3>Property Listings</h3><p>Manage and list properties with our intuitive interface for quick uploads and modifications.</p></div></div>
        <div class="col-lg-4 col-md-6"><div class="m3-svc md-reveal"><div class="m3-svc-icon"><span class="material-symbols-outlined">how_to_reg</span></div><h3>Tenant Management</h3><p>Comprehensive tenant management with screening, background checks, and lease tracking.</p></div></div>
        <div class="col-lg-4 col-md-6"><div class="m3-svc md-reveal"><div class="m3-svc-icon"><span class="material-symbols-outlined">notifications_active</span></div><h3>Real-time Updates</h3><p>Stay informed with instant notifications through our integrated communication system.</p></div></div>
        <div class="col-lg-4 col-md-6"><div class="m3-svc md-reveal"><div class="m3-svc-icon"><span class="material-symbols-outlined">support_agent</span></div><h3>Customer Support</h3><p>Our dedicated support team ensures all your queries are resolved promptly.</p></div></div>
        <div class="col-lg-4 col-md-6"><div class="m3-svc md-reveal"><div class="m3-svc-icon"><span class="material-symbols-outlined">shield</span></div><h3>Secure Transactions</h3><p>All transactions and data are protected with advanced security measures.</p></div></div>
        <div class="col-lg-4 col-md-6"><div class="m3-svc md-reveal"><div class="m3-svc-icon"><span class="material-symbols-outlined">trending_up</span></div><h3>Market Insights</h3><p>Gain valuable real estate market insights with advanced analytics and reporting.</p></div></div>
    </div>
</div></section>

<section id="featured" class="m3-sec m3-sec-s"><div class="container">
    <div class="m3-sh"><div class="m3-tag"><span class="material-symbols-outlined">star</span>Featured</div><h2 class="m3-stitle">Featured Properties</h2><p class="m3-ssub">Discover our handpicked selection of premium properties across Rwanda.</p></div>
    <div class="row g-4">
        {% for property in featured_properties %}
        <div class="col-lg-4 col-md-6"><div class="m3-pc md-reveal">
            <div class="m3-pc-img">
                {% if property.image %}<img src="{{ property.image.url }}" alt="{{ property.name }}" loading="lazy">{% else %}<img src="{% static 'images/placeholder.jpg' %}" alt="{{ property.name }}">{% endif %}
                <span class="m3-pc-badge">{{ property.get_types_display }}</span>
                <div class="m3-pc-price">{{ property.price|floatformat:0 }} <small>Frw/mo</small></div>
            </div>
            <div class="m3-pc-body">
                <h5>{{ property.name }}</h5>
                <div class="m3-pc-loc"><span class="material-symbols-outlined">location_on</span><span>{{ property.address }}</span></div>
                <div class="m3-pc-feats">
                    <div class="m3-pc-f"><span class="material-symbols-outlined">bed</span><div class="m3-pc-fv">{% with u=property.units.first %}{{ u.bedrooms|default:"—" }}{% endwith %}</div><div class="m3-pc-fl">Beds</div></div>
                    <div class="m3-pc-f"><span class="material-symbols-outlined">bathtub</span><div class="m3-pc-fv">{% with u=property.units.first %}{{ u.bathrooms|default:"—" }}{% endwith %}</div><div class="m3-pc-fl">Baths</div></div>
                    <div class="m3-pc-f"><span class="material-symbols-outlined">layers</span><div class="m3-pc-fv">{{ property.number_of_units }}</div><div class="m3-pc-fl">Units</div></div>
                </div>
                <p class="m3-pc-desc">{{ property.description|truncatewords:18 }}</p>
            </div>
            <div class="m3-pc-ft"><a href="{% url 'property_view' property.id %}" class="m3-btn-view">View Details <span class="material-symbols-outlined" style="font-size:18px">arrow_forward</span></a></div>
        </div></div>
        {% endfor %}
    </div>
    <div class="text-center mt-5"><a href="{% url 'property_list' %}" class="md-btn-filled" style="height:48px;padding:0 28px">View All Properties <span class="material-symbols-outlined" style="font-size:18px">arrow_forward</span></a></div>
</div></section>

<section id="testimonials" class="m3-sec m3-sec-c"><div class="container">
    <div class="m3-sh"><div class="m3-tag"><span class="material-symbols-outlined">format_quote</span>Testimonials</div><h2 class="m3-stitle">What Our Clients Say</h2><p class="m3-ssub">Hear from property owners and tenants who transformed their experience with Urugwiro.</p></div>
    <div class="row g-4">
        <div class="col-lg-4 col-md-6"><div class="m3-tc md-reveal">
            <div class="m3-tc-stars"><span class="material-symbols-outlined filled" style="color:#ffc107;font-size:20px">star</span><span class="material-symbols-outlined filled" style="color:#ffc107;font-size:20px">star</span><span class="material-symbols-outlined filled" style="color:#ffc107;font-size:20px">star</span><span class="material-symbols-outlined filled" style="color:#ffc107;font-size:20px">star</span><span class="material-symbols-outlined filled" style="color:#ffc107;font-size:20px">star</span></div>
            <p class="m3-tc-txt">"Urugwiro Properties has completely transformed how I manage my rental properties. Everything is streamlined and efficient!"</p>
            <div class="m3-tc-author"><img src="{% static 'images/man5.jpeg' %}" alt="Sarah K." class="m3-tc-avatar"><div><div class="m3-tc-name">Sarah K.</div><div class="m3-tc-role">Property Owner</div></div></div>
        </div></div>
        <div class="col-lg-4 col-md-6"><div class="m3-tc md-reveal">
            <div class="m3-tc-stars"><span class="material-symbols-outlined filled" style="color:#ffc107;font-size:20px">star</span><span class="material-symbols-outlined filled" style="color:#ffc107;font-size:20px">star</span><span class="material-symbols-outlined filled" style="color:#ffc107;font-size:20px">star</span><span class="material-symbols-outlined filled" style="color:#ffc107;font-size:20px">star</span><span class="material-symbols-outlined filled" style="color:#ffc107;font-size:20px">star</span></div>
            <p class="m3-tc-txt">"The customer support team is exceptional! They're always responsive and helpful with any questions I have."</p>
            <div class="m3-tc-author"><img src="{% static 'images/man0.jpeg' %}" alt="Mike T." class="m3-tc-avatar"><div><div class="m3-tc-name">Mike T.</div><div class="m3-tc-role">Tenant</div></div></div>
        </div></div>
        <div class="col-lg-4 col-md-6"><div class="m3-tc md-reveal">
            <div class="m3-tc-stars"><span class="material-symbols-outlined filled" style="color:#ffc107;font-size:20px">star</span><span class="material-symbols-outlined filled" style="color:#ffc107;font-size:20px">star</span><span class="material-symbols-outlined filled" style="color:#ffc107;font-size:20px">star</span><span class="material-symbols-outlined filled" style="color:#ffc107;font-size:20px">star</span><span class="material-symbols-outlined" style="color:#ffc107;font-size:20px">star_half</span></div>
            <p class="m3-tc-txt">"The market insights feature has helped me make smarter investment decisions. This platform is a game-changer!"</p>
            <div class="m3-tc-author"><img src="{% static 'images/man3.jpeg' %}" alt="Lisa M." class="m3-tc-avatar"><div><div class="m3-tc-name">Lisa M.</div><div class="m3-tc-role">Real Estate Pro</div></div></div>
        </div></div>
    </div>
</div></section>

<section class="m3-sec m3-sec-s"><div class="container">
    <div class="m3-sh"><div class="m3-tag"><span class="material-symbols-outlined">newspaper</span>Latest News</div><h2 class="m3-stitle">News & Updates</h2><p class="m3-ssub">Stay informed with the latest trends and updates in property management.</p></div>
    <div class="row g-4">
        <div class="col-lg-4 col-md-6"><div class="m3-nc md-reveal"><div class="m3-nc-img"><img src="{% static 'images/p1.jpg' %}" alt="Market Trends" loading="lazy"><span class="m3-nc-chip"><span class="material-symbols-outlined" style="font-size:14px">calendar_today</span>Oct 15, 2023</span></div><div class="m3-nc-body"><h5>Property Market Trends in 2023</h5><p>Discover the latest trends shaping the property market, including rising demand in urban areas.</p></div></div></div>
        <div class="col-lg-4 col-md-6"><div class="m3-nc md-reveal"><div class="m3-nc-img"><img src="{% static 'images/p2.webp' %}" alt="New Features" loading="lazy"><span class="m3-nc-chip"><span class="material-symbols-outlined" style="font-size:14px">calendar_today</span>Oct 10, 2023</span></div><div class="m3-nc-body"><h5>New Features Added to Urugwiro</h5><p>We've enhanced our platform with advanced analytics and improved tenant communication tools.</p></div></div></div>
        <div class="col-lg-4 col-md-6"><div class="m3-nc md-reveal"><div class="m3-nc-img"><img src="{% static 'images/p3.jpeg' %}" alt="Investment" loading="lazy"><span class="m3-nc-chip"><span class="material-symbols-outlined" style="font-size:14px">calendar_today</span>Oct 5, 2023</span></div><div class="m3-nc-body"><h5>Investment Opportunities in Real Estate</h5><p>Explore emerging markets and investment strategies to maximize returns in the current landscape.</p></div></div></div>
    </div>
</div></section>

<section class="m3-cta"><div class="container"><div class="m3-cta-inner md-reveal">
    <h2>Ready to Get Started?</h2>
    <p>Join thousands of satisfied property owners and tenants who have simplified their real estate journey with Urugwiro.</p>
    <div class="m3-cta-btns">
        <a href="{% url 'user_login' %}" class="m3-btn-w"><span class="material-symbols-outlined" style="font-size:20px">login</span>Login to Your Account</a>
        <a href="{% url 'register' %}" class="m3-btn-o"><span class="material-symbols-outlined" style="font-size:20px">person_add</span>Create New Account</a>
    </div>
</div></div></section>

<script>
document.addEventListener('DOMContentLoaded',function(){
    var counters=document.querySelectorAll('.m3-stat-val[data-count]');
    var cObs=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){counters.forEach(function(c){var target=parseInt(c.dataset.count),current=0,inc=target/60;var timer=setInterval(function(){current+=inc;if(current>=target){c.textContent=target.toLocaleString();clearInterval(timer)}else c.textContent=Math.floor(current).toLocaleString()},25)});cObs.unobserve(entry.target)}})},{threshold:.5});
    var s=document.querySelector('.m3-stats-inner');if(s)cObs.observe(s);
    document.querySelectorAll('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();var t=this.getAttribute('href');if(t==='#')return;var el=document.querySelector(t);if(el)window.scrollTo({top:el.offsetTop-80,behavior:'smooth'})})});
});
</script>
{% endblock %}
'''

# ─── about.html ──────────────────────────────────────────────────────────────
files['about.html'] = r'''{% extends 'home/base.html' %}
{% load static %}
{% block title %}About Us - Urugwiro Properties{% endblock %}
{% block content %}
<style>
    .m3-about-hero{margin-top:76px;padding:80px 0 70px;background:linear-gradient(160deg,#1a2a1a 0%,#1e3e2e 50%,#0d4a25 100%);position:relative;overflow:hidden;text-align:center;color:#fff}
    .m3-about-hero::before{content:'';position:absolute;width:400px;height:400px;top:-100px;right:-100px;background:radial-gradient(circle,rgba(40,167,69,.15) 0%,transparent 70%);border-radius:50%}
    .m3-about-hero::after{content:'';position:absolute;width:300px;height:300px;bottom:-80px;left:-80px;background:radial-gradient(circle,rgba(32,201,151,.12) 0%,transparent 70%);border-radius:50%}
    .m3-about-hero-inner{position:relative;z-index:2}
    .m3-about-hero h1{font:500 2.8rem/1.2 'Inter',sans-serif;margin-bottom:16px}
    .m3-about-hero p{color:rgba(255,255,255,.65);font:var(--md-sys-typescale-body-large);max-width:550px;margin:0 auto;line-height:1.7}
    .m3-sec{padding:90px 0}.m3-sec-s{background:var(--md-sys-color-surface)}.m3-sec-c{background:var(--md-sys-color-surface-container)}
    .m3-sh{text-align:center;margin-bottom:50px}
    .m3-tag{display:inline-flex;align-items:center;gap:8px;background:var(--md-sys-color-primary-container);color:var(--md-sys-color-on-primary-container);padding:6px 16px;border-radius:var(--md-sys-shape-corner-full);font:var(--md-sys-typescale-label-medium);letter-spacing:.5px;text-transform:uppercase;margin-bottom:14px}
    .m3-tag .material-symbols-outlined{font-size:16px}
    .m3-stitle{font:var(--md-sys-typescale-headline-large);color:var(--md-sys-color-on-surface);margin-bottom:14px}
    .m3-ssub{color:var(--md-sys-color-on-surface-variant);font:var(--md-sys-typescale-body-large);max-width:520px;margin:0 auto;line-height:1.7}
    .m3-story{background:var(--md-sys-color-surface-container-lowest);border-radius:var(--md-sys-shape-corner-large);overflow:hidden;border:1px solid var(--md-sys-color-outline-variant);transition:all 300ms var(--md-sys-motion-easing-emphasized)}
    .m3-story:hover{box-shadow:var(--md-sys-elevation-2);border-color:transparent;transform:translateY(-4px)}
    .m3-story-img{height:280px;overflow:hidden}
    .m3-story-img img{width:100%;height:100%;object-fit:cover;transition:transform .5s}
    .m3-story:hover .m3-story-img img{transform:scale(1.05)}
    .m3-story-body{padding:28px}
    .m3-story-body h3{font:var(--md-sys-typescale-title-large);color:var(--md-sys-color-on-surface);margin-bottom:14px;display:flex;align-items:center;gap:10px}
    .m3-story-body h3 .material-symbols-outlined{color:var(--md-sys-color-primary)}
    .m3-story-body p{color:var(--md-sys-color-on-surface-variant);line-height:1.8;font:var(--md-sys-typescale-body-medium);margin:0}
    .m3-tl{position:relative;padding:20px 0}
    .m3-tl::before{content:'';position:absolute;top:0;bottom:0;left:50%;width:2px;background:var(--md-sys-color-outline-variant);transform:translateX(-50%)}
    .m3-tl-item{position:relative;margin-bottom:40px;width:50%;padding-right:40px}
    .m3-tl-item:nth-child(even){margin-left:50%;padding-right:0;padding-left:40px}
    .m3-tl-dot{position:absolute;top:8px;width:14px;height:14px;border-radius:50%;background:var(--md-sys-color-primary);border:3px solid var(--md-sys-color-surface);box-shadow:0 0 0 3px var(--md-sys-color-primary-container);z-index:2}
    .m3-tl-item:nth-child(odd) .m3-tl-dot{right:-7px}
    .m3-tl-item:nth-child(even) .m3-tl-dot{left:-7px}
    .m3-tl-year{display:inline-block;background:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary);padding:4px 14px;border-radius:var(--md-sys-shape-corner-full);font:var(--md-sys-typescale-label-medium);margin-bottom:10px}
    .m3-tl-content{background:var(--md-sys-color-surface-container-lowest);border-radius:var(--md-sys-shape-corner-medium);padding:20px;border:1px solid var(--md-sys-color-outline-variant);transition:all 300ms}
    .m3-tl-content:hover{box-shadow:var(--md-sys-elevation-1)}
    .m3-tl-content h4{font:var(--md-sys-typescale-title-small);color:var(--md-sys-color-on-surface);margin-bottom:8px}
    .m3-tl-content p{font:var(--md-sys-typescale-body-medium);color:var(--md-sys-color-on-surface-variant);margin:0;line-height:1.6}
    .m3-about-stats{background:linear-gradient(135deg,var(--md-sys-color-inverse-surface),#0d4a25);padding:60px 0;position:relative;overflow:hidden}
    .m3-about-stats::before{content:'';position:absolute;inset:0;background:url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><circle cx="40" cy="40" r="1.5" fill="rgba(255,255,255,.04)"/></svg>');background-size:40px 40px}
    .m3-as{text-align:center;position:relative;z-index:2;padding:20px}
    .m3-as-val{font:500 2.4rem/1 'Inter',sans-serif;color:#fff;margin-bottom:4px}
    .m3-as-lbl{color:rgba(255,255,255,.6);font:var(--md-sys-typescale-label-medium)}
    .m3-val{background:var(--md-sys-color-surface-container-lowest);border-radius:var(--md-sys-shape-corner-large);padding:28px;border:1px solid var(--md-sys-color-outline-variant);transition:all 300ms;height:100%;overflow:hidden}
    .m3-val:hover{transform:translateY(-4px);box-shadow:var(--md-sys-elevation-2);border-color:transparent}
    .m3-val-icon{width:52px;height:52px;border-radius:var(--md-sys-shape-corner-large);background:var(--md-sys-color-primary-container);display:flex;align-items:center;justify-content:center;color:var(--md-sys-color-on-primary-container);margin-bottom:18px;transition:all 300ms}
    .m3-val:hover .m3-val-icon{background:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary);transform:scale(1.1)}
    .m3-val h4{font:var(--md-sys-typescale-title-small);color:var(--md-sys-color-on-surface);margin-bottom:8px}
    .m3-val p{font:var(--md-sys-typescale-body-medium);color:var(--md-sys-color-on-surface-variant);line-height:1.65;margin:0}
    .m3-team{text-align:center;transition:all 300ms}
    .m3-team:hover{transform:translateY(-8px)}
    .m3-team-img{position:relative;width:140px;height:140px;margin:0 auto 20px;border-radius:var(--md-sys-shape-corner-full);overflow:hidden;border:4px solid var(--md-sys-color-outline-variant);transition:all 300ms}
    .m3-team:hover .m3-team-img{border-color:var(--md-sys-color-primary)}
    .m3-team-img img{width:100%;height:100%;object-fit:cover}
    .m3-team h4{font:var(--md-sys-typescale-title-small);color:var(--md-sys-color-on-surface);margin-bottom:4px}
    .m3-team p{color:var(--md-sys-color-primary);font:var(--md-sys-typescale-label-medium);margin-bottom:12px}
    .m3-team-socials{display:flex;justify-content:center;gap:8px}
    .m3-team-socials a{width:34px;height:34px;border-radius:var(--md-sys-shape-corner-full);background:var(--md-sys-color-surface-container-high);display:flex;align-items:center;justify-content:center;color:var(--md-sys-color-on-surface-variant);font-size:.85rem;transition:all 200ms;text-decoration:none}
    .m3-team-socials a:hover{background:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary);transform:translateY(-2px)}
    .m3-about-cta{padding:80px 0;text-align:center;background:var(--md-sys-color-surface-container)}
    .m3-about-cta h3{font:var(--md-sys-typescale-headline-medium);color:var(--md-sys-color-on-surface);margin-bottom:14px}
    .m3-about-cta p{color:var(--md-sys-color-on-surface-variant);max-width:500px;margin:0 auto 30px;line-height:1.7;font:var(--md-sys-typescale-body-large)}
    @media(max-width:768px){
        .m3-about-hero h1{font-size:2rem}
        .m3-tl::before{left:20px}
        .m3-tl-item,.m3-tl-item:nth-child(even){width:100%;padding-left:50px;padding-right:0;margin-left:0}
        .m3-tl-item .m3-tl-dot,.m3-tl-item:nth-child(even) .m3-tl-dot{left:13px;right:auto}
        .m3-sec{padding:60px 0}.m3-as-val{font-size:1.8rem}
    }
</style>

<section class="m3-about-hero"><div class="container"><div class="m3-about-hero-inner">
    <h1>About Urugwiro</h1>
    <p>Revolutionizing property management with innovative solutions for owners, tenants, and real estate professionals across Rwanda.</p>
</div></div></section>

<section class="m3-sec m3-sec-c"><div class="container">
    <div class="m3-sh"><div class="m3-tag"><span class="material-symbols-outlined">auto_stories</span>Our Story</div><h2 class="m3-stitle">Who We Are</h2><p class="m3-ssub">A user-friendly platform that streamlines property management with efficiency, transparency, and innovation.</p></div>
    <div class="row g-4">
        <div class="col-lg-6 md-reveal"><div class="m3-story"><div class="m3-story-img"><img src="{% static 'images/mission.jpg' %}" alt="Our Mission" loading="lazy"></div><div class="m3-story-body"><h3><span class="material-symbols-outlined">target</span>Our Mission</h3><p>To simplify property management and create a seamless experience for everyone involved. We foster trust and transparency in real estate transactions, equipping users with essential tools for success.</p></div></div></div>
        <div class="col-lg-6 md-reveal"><div class="m3-story"><div class="m3-story-img"><img src="{% static 'images/history.jpg' %}" alt="Our History" loading="lazy"></div><div class="m3-story-body"><h3><span class="material-symbols-outlined">history</span>Our History</h3><p>Founded in 2020, Urugwiro bridges the gap between property management and technology. Our founders recognized the challenges faced by property owners and tenants, creating innovative solutions.</p></div></div></div>
    </div>
</div></section>

<section class="m3-sec m3-sec-s"><div class="container">
    <div class="m3-sh"><div class="m3-tag"><span class="material-symbols-outlined">route</span>Our Journey</div><h2 class="m3-stitle">Key Milestones</h2></div>
    <div class="m3-tl">
        <div class="m3-tl-item md-reveal"><div class="m3-tl-dot"></div><div class="m3-tl-year">2020</div><div class="m3-tl-content"><h4>Company Founded</h4><p>Urugwiro Properties was born from a vision to transform property management in Rwanda.</p></div></div>
        <div class="m3-tl-item md-reveal"><div class="m3-tl-dot"></div><div class="m3-tl-year">2021</div><div class="m3-tl-content"><h4>Platform Launch</h4><p>Launched our digital platform with core features for property listing and tenant management.</p></div></div>
        <div class="m3-tl-item md-reveal"><div class="m3-tl-dot"></div><div class="m3-tl-year">2022</div><div class="m3-tl-content"><h4>Rapid Growth</h4><p>Reached 1,000+ properties and became the fastest growing property management platform.</p></div></div>
        <div class="m3-tl-item md-reveal"><div class="m3-tl-dot"></div><div class="m3-tl-year">2023</div><div class="m3-tl-content"><h4>Advanced Analytics</h4><p>Introduced market insights, secure payments, and real-time communication tools.</p></div></div>
    </div>
</div></section>

<section class="m3-about-stats"><div class="container"><div class="row">
    <div class="col-md-3 col-6"><div class="m3-as md-reveal"><div class="m3-as-val">1,500+</div><div class="m3-as-lbl">Properties Managed</div></div></div>
    <div class="col-md-3 col-6"><div class="m3-as md-reveal"><div class="m3-as-val">500+</div><div class="m3-as-lbl">Happy Clients</div></div></div>
    <div class="col-md-3 col-6"><div class="m3-as md-reveal"><div class="m3-as-val">50+</div><div class="m3-as-lbl">RE Partners</div></div></div>
    <div class="col-md-3 col-6"><div class="m3-as md-reveal"><div class="m3-as-val">4.8★</div><div class="m3-as-lbl">User Rating</div></div></div>
</div></div></section>

<section class="m3-sec m3-sec-c"><div class="container">
    <div class="m3-sh"><div class="m3-tag"><span class="material-symbols-outlined">favorite</span>Core Values</div><h2 class="m3-stitle">What We Stand For</h2></div>
    <div class="row g-4">
        <div class="col-lg-4 col-md-6"><div class="m3-val md-reveal"><div class="m3-val-icon"><span class="material-symbols-outlined">diamond</span></div><h4>Integrity</h4><p>We operate with honesty and transparency in all our dealings, building trust with every interaction.</p></div></div>
        <div class="col-lg-4 col-md-6"><div class="m3-val md-reveal"><div class="m3-val-icon"><span class="material-symbols-outlined">lightbulb</span></div><h4>Innovation</h4><p>Continuously improving our platform with cutting-edge technology to stay ahead of the curve.</p></div></div>
        <div class="col-lg-4 col-md-6"><div class="m3-val md-reveal"><div class="m3-val-icon"><span class="material-symbols-outlined">groups</span></div><h4>Customer Focus</h4><p>Our users' success is our primary measure of achievement. We build for you.</p></div></div>
        <div class="col-lg-4 col-md-6"><div class="m3-val md-reveal"><div class="m3-val-icon"><span class="material-symbols-outlined">handshake</span></div><h4>Collaboration</h4><p>Building strong partnerships with all stakeholders in the real estate ecosystem.</p></div></div>
        <div class="col-lg-4 col-md-6"><div class="m3-val md-reveal"><div class="m3-val-icon"><span class="material-symbols-outlined">verified</span></div><h4>Excellence</h4><p>Striving for the highest standards in everything we do, from code to customer care.</p></div></div>
        <div class="col-lg-4 col-md-6"><div class="m3-val md-reveal"><div class="m3-val-icon"><span class="material-symbols-outlined">public</span></div><h4>Community</h4><p>Contributing to the growth and development of communities across Rwanda and beyond.</p></div></div>
    </div>
</div></section>

<section class="m3-sec m3-sec-s"><div class="container">
    <div class="m3-sh"><div class="m3-tag"><span class="material-symbols-outlined">badge</span>Leadership</div><h2 class="m3-stitle">Our Team</h2><p class="m3-ssub">Meet the passionate professionals driving innovation in property management.</p></div>
    <div class="row g-4 justify-content-center">
        <div class="col-lg-4 col-md-6"><div class="m3-team md-reveal"><div class="m3-team-img"><img src="{% static 'images/elbost.jpg' %}" alt="Elbost UZWINAYO"></div><h4>Elbost UZWINAYO</h4><p>CEO & Founder</p><div class="m3-team-socials"><a href="#"><i class="fab fa-linkedin-in"></i></a><a href="#"><i class="fab fa-twitter"></i></a><a href="#"><i class="fas fa-envelope"></i></a></div></div></div>
        <div class="col-lg-4 col-md-6"><div class="m3-team md-reveal"><div class="m3-team-img"><img src="{% static 'images/olivier.jpg' %}" alt="NSENGIMANA Olivier"></div><h4>NSENGIMANA Olivier</h4><p>CTO</p><div class="m3-team-socials"><a href="#"><i class="fab fa-linkedin-in"></i></a><a href="#"><i class="fab fa-github"></i></a><a href="#"><i class="fas fa-envelope"></i></a></div></div></div>
        <div class="col-lg-4 col-md-6"><div class="m3-team md-reveal"><div class="m3-team-img"><img src="{% static 'images/ismail.jpg' %}" alt="GIHOZO Ismail"></div><h4>GIHOZO Ismail</h4><p>Head of Operations</p><div class="m3-team-socials"><a href="#"><i class="fab fa-linkedin-in"></i></a><a href="#"><i class="fab fa-twitter"></i></a><a href="#"><i class="fas fa-envelope"></i></a></div></div></div>
    </div>
</div></section>

<section class="m3-about-cta"><div class="container">
    <h3>Join Us on Our Journey!</h3>
    <p>We're always looking for fresh talent and innovative ideas. If you're passionate about property management and technology, get in touch!</p>
    <a href="{% url 'contact' %}" class="md-btn-filled" style="height:48px;padding:0 28px"><span class="material-symbols-outlined" style="font-size:20px">mail</span>Contact Us</a>
</div></section>
{% endblock %}
'''

# ─── Login.html ──────────────────────────────────────────────────────────────
files['Login.html'] = r'''{% extends 'home/base.html' %}
{% load static %}
{% block title %}Login - Urugwiro Properties{% endblock %}
{% block content %}
<style>
    .m3-auth{display:flex;min-height:100vh;margin-top:76px}
    .m3-auth-brand{flex:1;background:linear-gradient(160deg,#1a2a1a 0%,#1e3e2e 40%,#0d4a25 100%);display:flex;align-items:center;justify-content:center;padding:60px 40px;position:relative;overflow:hidden}
    .m3-auth-brand::before{content:'';position:absolute;top:-100px;right:-100px;width:400px;height:400px;background:radial-gradient(circle,rgba(40,167,69,.2) 0%,transparent 70%);border-radius:50%}
    .m3-auth-brand::after{content:'';position:absolute;bottom:-60px;left:-60px;width:300px;height:300px;background:radial-gradient(circle,rgba(32,201,151,.15) 0%,transparent 70%);border-radius:50%}
    .m3-brand-inner{position:relative;z-index:2;text-align:center;max-width:400px;color:#fff}
    .m3-brand-logo{width:80px;height:80px;border-radius:var(--md-sys-shape-corner-extra-large);background:rgba(255,255,255,.1);backdrop-filter:blur(16px);display:flex;align-items:center;justify-content:center;margin:0 auto 24px;border:1px solid rgba(255,255,255,.15)}
    .m3-brand-logo .material-symbols-outlined{font-size:2rem;color:var(--md-sys-color-inverse-primary)}
    .m3-brand-inner h2{font:500 1.8rem/1.3 'Inter',sans-serif;margin-bottom:12px}
    .m3-brand-inner p{color:rgba(255,255,255,.6);font:var(--md-sys-typescale-body-medium);line-height:1.7;margin-bottom:32px}
    .m3-brand-stats{display:flex;gap:24px;justify-content:center}
    .m3-bs{text-align:center}.m3-bs-v{font:600 1.4rem/1 'Inter',sans-serif;color:#fff}.m3-bs-l{font:var(--md-sys-typescale-label-small);color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.5px}
    .m3-auth-form{flex:1;display:flex;align-items:center;justify-content:center;padding:60px 40px;background:var(--md-sys-color-surface)}
    .m3-auth-inner{width:100%;max-width:420px}
    .m3-auth-inner h1{font:500 1.8rem/1.3 'Inter',sans-serif;color:var(--md-sys-color-on-surface);margin-bottom:8px}
    .m3-auth-inner .m3-auth-sub{color:var(--md-sys-color-on-surface-variant);font:var(--md-sys-typescale-body-medium);margin-bottom:32px}
    .m3-field{position:relative;margin-bottom:20px}
    .m3-field-icon{position:absolute;top:50%;left:16px;transform:translateY(-50%);color:var(--md-sys-color-on-surface-variant);z-index:2}
    .m3-field-icon .material-symbols-outlined{font-size:20px}
    .m3-field label{position:absolute;top:50%;left:48px;transform:translateY(-50%);font:var(--md-sys-typescale-body-medium);color:var(--md-sys-color-on-surface-variant);transition:all 200ms;pointer-events:none;background:transparent;padding:0 4px}
    .m3-field input:focus~label,.m3-field input:not(:placeholder-shown)~label{top:0;font:var(--md-sys-typescale-label-small);color:var(--md-sys-color-primary);background:var(--md-sys-color-surface)}
    .m3-field input{width:100%;padding:16px 16px 16px 48px;border:1.5px solid var(--md-sys-color-outline-variant);border-radius:var(--md-sys-shape-corner-medium);font:var(--md-sys-typescale-body-medium);background:var(--md-sys-color-surface);color:var(--md-sys-color-on-surface);transition:all 200ms;outline:none}
    .m3-field input:focus{border-color:var(--md-sys-color-primary);box-shadow:0 0 0 4px rgba(40,167,69,.08)}
    .m3-field input:focus~.m3-field-icon .material-symbols-outlined{color:var(--md-sys-color-primary)}
    .m3-pass-toggle{position:absolute;top:50%;right:16px;transform:translateY(-50%);background:none;border:none;color:var(--md-sys-color-on-surface-variant);cursor:pointer;z-index:2;border-radius:var(--md-sys-shape-corner-full);width:36px;height:36px;display:flex;align-items:center;justify-content:center;transition:background 150ms}
    .m3-pass-toggle:hover{background:var(--md-sys-color-surface-container-high)}
    .m3-form-opts{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}
    .m3-form-opts label{font:var(--md-sys-typescale-body-small);color:var(--md-sys-color-on-surface-variant)}
    .m3-form-opts a{font:var(--md-sys-typescale-label-medium);color:var(--md-sys-color-primary);text-decoration:none}
    .m3-form-opts a:hover{text-decoration:underline}
    .m3-btn-auth{width:100%;height:48px;background:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary);border:none;border-radius:var(--md-sys-shape-corner-full);font:var(--md-sys-typescale-label-large);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 200ms}
    .m3-btn-auth:hover{box-shadow:var(--md-sys-elevation-1)}
    .m3-auth-divider{display:flex;align-items:center;gap:16px;margin:24px 0;color:var(--md-sys-color-on-surface-variant);font:var(--md-sys-typescale-body-small)}
    .m3-auth-divider::before,.m3-auth-divider::after{content:'';flex:1;height:1px;background:var(--md-sys-color-outline-variant)}
    .m3-auth-footer{text-align:center;font:var(--md-sys-typescale-body-medium);color:var(--md-sys-color-on-surface-variant)}
    .m3-auth-footer a{color:var(--md-sys-color-primary);font-weight:600;text-decoration:none}
    .m3-auth-footer a:hover{text-decoration:underline}
    .m3-alert{border-radius:var(--md-sys-shape-corner-medium);border:none;padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;gap:10px;font:var(--md-sys-typescale-body-medium)}
    @media(max-width:992px){.m3-auth-brand{display:none}.m3-auth-form{padding:40px 24px}}
    @media(max-width:576px){.m3-auth-form{padding:30px 16px}.m3-auth-inner h1{font-size:1.5rem}}
</style>
<div class="m3-auth">
    <div class="m3-auth-brand"><div class="m3-brand-inner">
        <div class="m3-brand-logo"><span class="material-symbols-outlined">apartment</span></div>
        <h2>Welcome Back!</h2>
        <p>Access your Urugwiro dashboard to manage properties, track leases, and stay connected with your real estate portfolio.</p>
        <div class="m3-brand-stats"><div class="m3-bs"><div class="m3-bs-v">1,500+</div><div class="m3-bs-l">Properties</div></div><div class="m3-bs"><div class="m3-bs-v">500+</div><div class="m3-bs-l">Clients</div></div><div class="m3-bs"><div class="m3-bs-v">4.8★</div><div class="m3-bs-l">Rating</div></div></div>
    </div></div>
    <div class="m3-auth-form"><div class="m3-auth-inner">
        <h1>Sign In</h1>
        <p class="m3-auth-sub">Enter your credentials to access your account</p>
        {% if messages %}{% for message in messages %}<div class="alert m3-alert alert-{{ message.tags|default:'info' }} alert-dismissible fade show"><span class="material-symbols-outlined" style="font-size:20px">{% if message.tags == 'error' %}error{% else %}check_circle{% endif %}</span>{{ message }}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>{% endfor %}{% endif %}
        <form action="{% url 'user_login' %}" method="POST">{% csrf_token %}
            <div class="m3-field"><div class="m3-field-icon"><span class="material-symbols-outlined">person</span></div><input type="text" id="username" name="username" placeholder=" " required autocomplete="username"><label for="username">Username</label></div>
            <div class="m3-field"><div class="m3-field-icon"><span class="material-symbols-outlined">lock</span></div><input type="password" id="password" name="password" placeholder=" " required autocomplete="current-password"><label for="password">Password</label><button type="button" class="m3-pass-toggle" onclick="togglePassword()"><span class="material-symbols-outlined" id="toggleIcon" style="font-size:20px">visibility</span></button></div>
            <div class="m3-form-opts"><div class="form-check"><input class="form-check-input" type="checkbox" id="remember"><label class="form-check-label" for="remember">Remember me</label></div><a href="#">Forgot Password?</a></div>
            <button type="submit" class="m3-btn-auth"><span class="material-symbols-outlined" style="font-size:20px">login</span>Sign In</button>
        </form>
        <div class="m3-auth-divider">or</div>
        <div class="m3-auth-footer">Don't have an account? <a href="{% url 'register' %}">Create one</a></div>
    </div></div>
</div>
<script>function togglePassword(){var p=document.getElementById('password'),i=document.getElementById('toggleIcon');if(p.type==='password'){p.type='text';i.textContent='visibility_off'}else{p.type='password';i.textContent='visibility'}}</script>
{% endblock %}
'''

# ─── Register.html ───────────────────────────────────────────────────────────
files['Register.html'] = r'''{% extends 'home/base.html' %}
{% load static %}
{% block title %}Register - Urugwiro Properties{% endblock %}
{% block content %}
<style>
    .m3-auth{display:flex;min-height:100vh;margin-top:76px}
    .m3-auth-brand{flex:1;background:linear-gradient(160deg,#1a2a1a 0%,#1e3e2e 40%,#0d4a25 100%);display:flex;align-items:center;justify-content:center;padding:60px 40px;position:relative;overflow:hidden}
    .m3-auth-brand::before{content:'';position:absolute;top:-100px;right:-100px;width:400px;height:400px;background:radial-gradient(circle,rgba(40,167,69,.2) 0%,transparent 70%);border-radius:50%}
    .m3-auth-brand::after{content:'';position:absolute;bottom:-60px;left:-60px;width:300px;height:300px;background:radial-gradient(circle,rgba(32,201,151,.15) 0%,transparent 70%);border-radius:50%}
    .m3-brand-inner{position:relative;z-index:2;text-align:center;max-width:400px;color:#fff}
    .m3-brand-logo{width:80px;height:80px;border-radius:var(--md-sys-shape-corner-extra-large);background:rgba(255,255,255,.1);backdrop-filter:blur(16px);display:flex;align-items:center;justify-content:center;margin:0 auto 24px;border:1px solid rgba(255,255,255,.15)}
    .m3-brand-logo .material-symbols-outlined{font-size:2rem;color:var(--md-sys-color-inverse-primary)}
    .m3-brand-inner h2{font:500 1.8rem/1.3 'Inter',sans-serif;margin-bottom:12px}
    .m3-brand-inner p{color:rgba(255,255,255,.6);font:var(--md-sys-typescale-body-medium);line-height:1.7;margin-bottom:32px}
    .m3-brand-features{text-align:left;max-width:320px;margin:0 auto}
    .m3-brand-feat{display:flex;align-items:center;gap:12px;margin-bottom:16px;color:rgba(255,255,255,.8);font:var(--md-sys-typescale-body-medium)}
    .m3-brand-feat-icon{width:36px;height:36px;border-radius:var(--md-sys-shape-corner-medium);flex-shrink:0;background:rgba(40,167,69,.2);display:flex;align-items:center;justify-content:center;color:var(--md-sys-color-inverse-primary)}
    .m3-brand-feat-icon .material-symbols-outlined{font-size:18px}
    .m3-auth-form{flex:1;display:flex;align-items:center;justify-content:center;padding:60px 40px;background:var(--md-sys-color-surface)}
    .m3-auth-inner{width:100%;max-width:420px}
    .m3-auth-inner h1{font:500 1.8rem/1.3 'Inter',sans-serif;color:var(--md-sys-color-on-surface);margin-bottom:8px}
    .m3-auth-inner .m3-auth-sub{color:var(--md-sys-color-on-surface-variant);font:var(--md-sys-typescale-body-medium);margin-bottom:32px}
    .m3-field{position:relative;margin-bottom:20px}
    .m3-field-icon{position:absolute;top:50%;left:16px;transform:translateY(-50%);color:var(--md-sys-color-on-surface-variant);z-index:2}
    .m3-field-icon .material-symbols-outlined{font-size:20px}
    .m3-field label{position:absolute;top:50%;left:48px;transform:translateY(-50%);font:var(--md-sys-typescale-body-medium);color:var(--md-sys-color-on-surface-variant);transition:all 200ms;pointer-events:none;background:transparent;padding:0 4px}
    .m3-field input:focus~label,.m3-field input:not(:placeholder-shown)~label{top:0;font:var(--md-sys-typescale-label-small);color:var(--md-sys-color-primary);background:var(--md-sys-color-surface)}
    .m3-field input{width:100%;padding:16px 16px 16px 48px;border:1.5px solid var(--md-sys-color-outline-variant);border-radius:var(--md-sys-shape-corner-medium);font:var(--md-sys-typescale-body-medium);background:var(--md-sys-color-surface);color:var(--md-sys-color-on-surface);transition:all 200ms;outline:none}
    .m3-field input:focus{border-color:var(--md-sys-color-primary);box-shadow:0 0 0 4px rgba(40,167,69,.08)}
    .m3-field input:focus~.m3-field-icon .material-symbols-outlined{color:var(--md-sys-color-primary)}
    .m3-pass-toggle{position:absolute;top:50%;right:16px;transform:translateY(-50%);background:none;border:none;color:var(--md-sys-color-on-surface-variant);cursor:pointer;z-index:2;border-radius:var(--md-sys-shape-corner-full);width:36px;height:36px;display:flex;align-items:center;justify-content:center;transition:background 150ms}
    .m3-pass-toggle:hover{background:var(--md-sys-color-surface-container-high)}
    .m3-strength{height:4px;border-radius:2px;background:var(--md-sys-color-outline-variant);margin-top:8px;overflow:hidden}
    .m3-strength-bar{height:100%;width:0;border-radius:2px;transition:all 300ms}
    .m3-strength-txt{font:var(--md-sys-typescale-label-small);margin-top:4px}
    .m3-btn-auth{width:100%;height:48px;background:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary);border:none;border-radius:var(--md-sys-shape-corner-full);font:var(--md-sys-typescale-label-large);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 200ms;margin-top:24px}
    .m3-btn-auth:hover{box-shadow:var(--md-sys-elevation-1)}
    .m3-auth-divider{display:flex;align-items:center;gap:16px;margin:24px 0;color:var(--md-sys-color-on-surface-variant);font:var(--md-sys-typescale-body-small)}
    .m3-auth-divider::before,.m3-auth-divider::after{content:'';flex:1;height:1px;background:var(--md-sys-color-outline-variant)}
    .m3-auth-footer{text-align:center;font:var(--md-sys-typescale-body-medium);color:var(--md-sys-color-on-surface-variant)}
    .m3-auth-footer a{color:var(--md-sys-color-primary);font-weight:600;text-decoration:none}
    .m3-auth-footer a:hover{text-decoration:underline}
    .m3-terms{font:var(--md-sys-typescale-body-small);color:var(--md-sys-color-on-surface-variant);text-align:center;margin-top:20px;line-height:1.5}
    .m3-terms a{color:var(--md-sys-color-primary);text-decoration:none}
    .m3-alert{border-radius:var(--md-sys-shape-corner-medium);border:none;padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;gap:10px;font:var(--md-sys-typescale-body-medium)}
    @media(max-width:992px){.m3-auth-brand{display:none}.m3-auth-form{padding:40px 24px}}
    @media(max-width:576px){.m3-auth-form{padding:30px 16px}.m3-auth-inner h1{font-size:1.5rem}}
</style>
<div class="m3-auth">
    <div class="m3-auth-brand"><div class="m3-brand-inner">
        <div class="m3-brand-logo"><span class="material-symbols-outlined">person_add</span></div>
        <h2>Join Urugwiro</h2>
        <p>Create your account and start managing your property journey today.</p>
        <div class="m3-brand-features">
            <div class="m3-brand-feat"><div class="m3-brand-feat-icon"><span class="material-symbols-outlined">check</span></div><span>Free account setup</span></div>
            <div class="m3-brand-feat"><div class="m3-brand-feat-icon"><span class="material-symbols-outlined">shield</span></div><span>Secure & encrypted data</span></div>
            <div class="m3-brand-feat"><div class="m3-brand-feat-icon"><span class="material-symbols-outlined">notifications</span></div><span>Real-time property alerts</span></div>
            <div class="m3-brand-feat"><div class="m3-brand-feat-icon"><span class="material-symbols-outlined">trending_up</span></div><span>Market insights & analytics</span></div>
        </div>
    </div></div>
    <div class="m3-auth-form"><div class="m3-auth-inner">
        <h1>Create Account</h1>
        <p class="m3-auth-sub">Fill in the details below to get started</p>
        {% if messages %}{% for message in messages %}<div class="alert m3-alert alert-{{ message.tags|default:'info' }} alert-dismissible fade show"><span class="material-symbols-outlined" style="font-size:20px">{% if message.tags == 'error' %}error{% elif message.tags == 'success' %}check_circle{% else %}info{% endif %}</span>{{ message }}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>{% endfor %}{% endif %}
        <form action="{% url 'user_register' %}" method="POST">{% csrf_token %}
            <div class="m3-field"><div class="m3-field-icon"><span class="material-symbols-outlined">person</span></div><input type="text" id="username" name="username" placeholder=" " required autocomplete="username"><label for="username">Username</label></div>
            <div class="m3-field"><div class="m3-field-icon"><span class="material-symbols-outlined">email</span></div><input type="email" id="email" name="email" placeholder=" " required autocomplete="email"><label for="email">Email Address</label></div>
            <div class="m3-field"><div class="m3-field-icon"><span class="material-symbols-outlined">lock</span></div><input type="password" id="password" name="password" placeholder=" " required autocomplete="new-password" oninput="checkStrength(this.value)"><label for="password">Password</label><button type="button" class="m3-pass-toggle" onclick="togglePassword()"><span class="material-symbols-outlined" id="toggleIcon" style="font-size:20px">visibility</span></button></div>
            <div class="m3-strength"><div class="m3-strength-bar" id="strengthBar"></div></div>
            <div class="m3-strength-txt" id="strengthText"></div>
            <button type="submit" class="m3-btn-auth"><span class="material-symbols-outlined" style="font-size:20px">person_add</span>Create Account</button>
        </form>
        <div class="m3-auth-divider">or</div>
        <div class="m3-auth-footer">Already have an account? <a href="{% url 'user_login' %}">Sign In</a></div>
        <p class="m3-terms">By creating an account, you agree to our<br><a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></p>
    </div></div>
</div>
<script>
function togglePassword(){var p=document.getElementById('password'),i=document.getElementById('toggleIcon');if(p.type==='password'){p.type='text';i.textContent='visibility_off'}else{p.type='password';i.textContent='visibility'}}
function checkStrength(val){var bar=document.getElementById('strengthBar'),txt=document.getElementById('strengthText'),score=0;if(val.length>=6)score++;if(val.length>=10)score++;if(/[A-Z]/.test(val))score++;if(/[0-9]/.test(val))score++;if(/[^A-Za-z0-9]/.test(val))score++;var levels=[{w:'0%',c:'var(--md-sys-color-outline-variant)',t:''},{w:'20%',c:'var(--md-sys-color-error)',t:'Very Weak'},{w:'40%',c:'#fd7e14',t:'Weak'},{w:'60%',c:'#ffc107',t:'Fair'},{w:'80%',c:'var(--md-sys-color-primary)',t:'Strong'},{w:'100%',c:'#0d4a25',t:'Very Strong'}],l=levels[score];bar.style.width=l.w;bar.style.background=l.c;txt.textContent=l.t;txt.style.color=l.c}
</script>
{% endblock %}
'''

# ─── contact.html ────────────────────────────────────────────────────────────
files['contact.html'] = r'''{% extends 'home/base.html' %}
{% load static %}
{% block title %}Contact Us - Urugwiro Properties{% endblock %}
{% block content %}
<style>
    .m3-contact-hero{background:linear-gradient(135deg,#1a2a1a 0%,#0d4a25 100%);color:#fff;padding:100px 0 80px;margin-top:76px;text-align:center;position:relative;overflow:hidden}
    .m3-contact-hero::before{content:'';position:absolute;width:400px;height:400px;top:-100px;right:-100px;background:radial-gradient(circle,rgba(40,167,69,.15) 0%,transparent 70%);border-radius:50%}
    .m3-contact-hero-inner{position:relative;z-index:1}
    .m3-contact-hero h1{font:500 2.8rem/1.2 'Inter',sans-serif;margin-bottom:1rem}
    .m3-contact-hero p{font:var(--md-sys-typescale-body-large);opacity:.8;max-width:600px;margin:0 auto}
    .m3-contact-sec{padding:80px 0;background:var(--md-sys-color-surface-container)}
    .m3-contact-title{position:relative;margin-bottom:50px;font:var(--md-sys-typescale-headline-medium);color:var(--md-sys-color-on-surface);text-align:center}
    .m3-contact-title::after{content:'';position:absolute;bottom:-15px;left:50%;transform:translateX(-50%);width:60px;height:3px;background:var(--md-sys-color-primary);border-radius:var(--md-sys-shape-corner-full)}
    .m3-cc{background:var(--md-sys-color-surface-container-lowest);border-radius:var(--md-sys-shape-corner-large);padding:36px 28px;text-align:center;border:1px solid var(--md-sys-color-outline-variant);transition:all 300ms;height:100%;margin-bottom:30px}
    .m3-cc:hover{transform:translateY(-4px);box-shadow:var(--md-sys-elevation-2);border-color:transparent}
    .m3-cc-icon{width:72px;height:72px;background:var(--md-sys-color-primary-container);border-radius:var(--md-sys-shape-corner-full);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;color:var(--md-sys-color-on-primary-container);transition:all 300ms}
    .m3-cc:hover .m3-cc-icon{background:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary);transform:scale(1.1)}
    .m3-cc h3{font:var(--md-sys-typescale-title-medium);color:var(--md-sys-color-on-surface);margin-bottom:10px}
    .m3-cc p{font:var(--md-sys-typescale-body-medium);color:var(--md-sys-color-on-surface-variant);margin-bottom:16px;line-height:1.6}
    .m3-cc a{color:var(--md-sys-color-primary);text-decoration:none;font:var(--md-sys-typescale-label-large);display:inline-flex;align-items:center;gap:4px;transition:all 200ms}
    .m3-cc a:hover{gap:8px}
    .m3-form-card{background:var(--md-sys-color-surface-container-lowest);border-radius:var(--md-sys-shape-corner-large);box-shadow:var(--md-sys-elevation-1);overflow:hidden;margin-bottom:30px}
    .m3-form-header{background:var(--md-sys-color-secondary-container);color:var(--md-sys-color-on-secondary-container);padding:20px 28px;font:var(--md-sys-typescale-title-medium);display:flex;align-items:center;gap:10px}
    .m3-form-body{padding:28px}
    .m3-form-body .form-control{border:1.5px solid var(--md-sys-color-outline-variant);border-radius:var(--md-sys-shape-corner-medium);padding:14px 16px;font:var(--md-sys-typescale-body-large);transition:all 200ms;background:var(--md-sys-color-surface)}
    .m3-form-body .form-control:focus{border-color:var(--md-sys-color-primary);box-shadow:0 0 0 4px rgba(40,167,69,.08)}
    .m3-form-body label{font:var(--md-sys-typescale-label-large);color:var(--md-sys-color-on-surface);margin-bottom:6px;display:flex;align-items:center;gap:6px}
    .m3-form-body label .material-symbols-outlined{color:var(--md-sys-color-primary);font-size:18px}
    .m3-btn-submit{width:100%;height:48px;background:var(--md-sys-color-primary);color:var(--md-sys-color-on-primary);border:none;border-radius:var(--md-sys-shape-corner-full);font:var(--md-sys-typescale-label-large);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 200ms}
    .m3-btn-submit:hover{box-shadow:var(--md-sys-elevation-1)}
    .m3-info-card{background:var(--md-sys-color-surface-container-lowest);border-radius:var(--md-sys-shape-corner-large);border:1px solid var(--md-sys-color-outline-variant);padding:28px;height:100%}
    .m3-info-sec{margin-bottom:28px}
    .m3-info-sec h4{font:var(--md-sys-typescale-title-small);color:var(--md-sys-color-on-surface);margin-bottom:16px;display:flex;align-items:center;gap:10px}
    .m3-info-sec h4 .material-symbols-outlined{color:var(--md-sys-color-primary);font-size:20px}
    .m3-info-item{display:flex;align-items:flex-start;margin-bottom:14px;gap:12px}
    .m3-info-icon{width:40px;height:40px;border-radius:var(--md-sys-shape-corner-full);background:var(--md-sys-color-surface-container-high);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--md-sys-color-primary)}
    .m3-info-icon .material-symbols-outlined{font-size:20px}
    .m3-info-content{flex:1}.m3-info-content strong{font:var(--md-sys-typescale-label-large);color:var(--md-sys-color-on-surface);display:block;margin-bottom:4px}
    .m3-info-content a,.m3-info-content span{color:var(--md-sys-color-on-surface-variant);text-decoration:none;font:var(--md-sys-typescale-body-medium)}
    .m3-info-content a:hover{color:var(--md-sys-color-primary)}
    .m3-hours{list-style:none;padding:0}.m3-hours li{padding:8px 0;border-bottom:1px solid var(--md-sys-color-outline-variant);display:flex;justify-content:space-between;font:var(--md-sys-typescale-body-medium)}
    .m3-hours li:last-child{border-bottom:none}.m3-hours .day{font-weight:600;color:var(--md-sys-color-on-surface)}.m3-hours .time{color:var(--md-sys-color-on-surface-variant)}
    .m3-map-sec{padding:80px 0;background:var(--md-sys-color-surface)}
    .m3-map-box{background:var(--md-sys-color-surface-container-lowest);border-radius:var(--md-sys-shape-corner-large);box-shadow:var(--md-sys-elevation-1);overflow:hidden;height:400px}
    .m3-map-placeholder{width:100%;height:100%;background:linear-gradient(135deg,var(--md-sys-color-inverse-surface),#0d4a25);display:flex;align-items:center;justify-content:center;color:#fff;font:var(--md-sys-typescale-body-large)}
    @media(max-width:768px){.m3-contact-hero h1{font-size:2.2rem}.m3-contact-sec{padding:60px 0}}
</style>

<section class="m3-contact-hero"><div class="container"><div class="m3-contact-hero-inner">
    <h1>Contact Us</h1>
    <p>We're here to help! Get in touch with our team for any questions or inquiries about our properties and services.</p>
</div></div></section>

<section class="m3-contact-sec"><div class="container">
    <h2 class="m3-contact-title">Get in Touch</h2>
    <div class="row mb-5">
        <div class="col-md-4"><div class="m3-cc"><div class="m3-cc-icon"><span class="material-symbols-outlined" style="font-size:28px">email</span></div><h3>Email Us</h3><p>Send us an email and we'll respond quickly</p><a href="mailto:support@urugwiro.com">support@urugwiro.com <span class="material-symbols-outlined" style="font-size:16px">arrow_forward</span></a></div></div>
        <div class="col-md-4"><div class="m3-cc"><div class="m3-cc-icon"><span class="material-symbols-outlined" style="font-size:28px">call</span></div><h3>Call Us</h3><p>Speak directly with our support team</p><a href="tel:+250788123456">+250 788 123 456 <span class="material-symbols-outlined" style="font-size:16px">arrow_forward</span></a></div></div>
        <div class="col-md-4"><div class="m3-cc"><div class="m3-cc-icon"><span class="material-symbols-outlined" style="font-size:28px">location_on</span></div><h3>Visit Us</h3><p>Come visit our office during business hours</p><a href="#map">View Location <span class="material-symbols-outlined" style="font-size:16px">arrow_forward</span></a></div></div>
    </div>
    <div class="row">
        <div class="col-lg-8 mb-4"><div class="m3-form-card">
            <div class="m3-form-header"><span class="material-symbols-outlined">send</span>Send us a Message</div>
            <div class="m3-form-body">
                {% if messages %}{% for message in messages %}<div class="alert alert-{{ message.tags }} alert-dismissible fade show" style="border-radius:var(--md-sys-shape-corner-medium);border:none"><span class="material-symbols-outlined" style="font-size:20px">{% if message.tags == 'success' %}check_circle{% else %}warning{% endif %}</span> {{ message }}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>{% endfor %}{% endif %}
                <form action="customer_message" method="POST">{% csrf_token %}
                    <div class="row">
                        <div class="col-md-6 mb-3"><label for="name"><span class="material-symbols-outlined">person</span>Full Name</label><input type="text" class="form-control" id="name" name="name" placeholder="Enter your full name" required></div>
                        <div class="col-md-6 mb-3"><label for="email"><span class="material-symbols-outlined">email</span>Email Address</label><input type="email" class="form-control" id="email" name="email" placeholder="Enter your email" required></div>
                    </div>
                    <div class="mb-3"><label for="message"><span class="material-symbols-outlined">chat</span>Your Message</label><textarea class="form-control" id="message" name="message" rows="6" placeholder="Tell us how we can help you..." required></textarea></div>
                    <button type="submit" class="m3-btn-submit"><span class="material-symbols-outlined" style="font-size:20px">send</span>Send Message</button>
                </form>
            </div>
        </div></div>
        <div class="col-lg-4"><div class="m3-info-card">
            <div class="m3-info-sec"><h4><span class="material-symbols-outlined">info</span>Contact Information</h4>
                <div class="m3-info-item"><div class="m3-info-icon"><span class="material-symbols-outlined">email</span></div><div class="m3-info-content"><strong>Email</strong><a href="mailto:support@urugwiro.com">support@urugwiro.com</a></div></div>
                <div class="m3-info-item"><div class="m3-info-icon"><span class="material-symbols-outlined">call</span></div><div class="m3-info-content"><strong>Phone</strong><a href="tel:+250788123456">+250 788 123 456</a></div></div>
                <div class="m3-info-item"><div class="m3-info-icon"><span class="material-symbols-outlined">location_on</span></div><div class="m3-info-content"><strong>Address</strong><span>KG 123 St, Kigali Heights<br>Kigali, Rwanda</span></div></div>
            </div>
            <div class="m3-info-sec"><h4><span class="material-symbols-outlined">schedule</span>Support Hours</h4>
                <ul class="m3-hours"><li><span class="day">Monday - Friday</span><span class="time">9:00 AM - 6:00 PM</span></li><li><span class="day">Saturday</span><span class="time">10:00 AM - 2:00 PM</span></li><li><span class="day">Sunday</span><span class="time">Closed</span></li></ul>
            </div>
            <div class="m3-info-sec"><h4><span class="material-symbols-outlined">emergency</span>Emergency Support</h4>
                <p style="font:var(--md-sys-typescale-body-small);color:var(--md-sys-color-on-surface-variant)">For urgent property-related issues outside business hours:</p>
                <div class="m3-info-item"><div class="m3-info-icon"><span class="material-symbols-outlined">phone_in_talk</span></div><div class="m3-info-content"><strong>Emergency Line</strong><a href="tel:+250788999999">+250 788 999 999</a></div></div>
            </div>
        </div></div>
    </div>
</div></section>

<section class="m3-map-sec" id="map"><div class="container">
    <h2 class="m3-contact-title">Find Us</h2>
    <div class="m3-map-box"><div class="m3-map-placeholder"><div class="text-center">
        <span class="material-symbols-outlined" style="font-size:3rem;display:block;margin-bottom:12px">map</span>
        <h4 style="font:var(--md-sys-typescale-title-large)">Our Location</h4>
        <p>KG 123 St, Kigali Heights, Kigali, Rwanda</p>
        <a href="https://maps.google.com?q=KG+123+St,+Kigali+Heights,+Kigali,+Rwanda" target="_blank" class="md-btn-filled" style="margin-top:16px"><span class="material-symbols-outlined" style="font-size:18px">open_in_new</span>Open in Google Maps</a>
    </div></div></div>
</div></section>
{% endblock %}
'''

# ─── Write all files ─────────────────────────────────────────────────────────
for name, content in files.items():
    path = os.path.join(TPL, name)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f"  ✅ {name} ({len(content):,} chars)")

print("\n🎉 All Material Design 3 templates applied successfully!")

