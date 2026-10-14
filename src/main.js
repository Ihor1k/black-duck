import './scss/main.scss';

const sectionVideos = document.querySelectorAll(
  '.hero__media video, .sol-card--media video, .about-hero__media video, .infra-hero__media video, .infra-band video'
);

if (sectionVideos.length) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const syncSectionVideo = (video) => {
    if (reduceMotion.matches) {
      video.pause();
      video.removeAttribute('autoplay');
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');

    const tryPlay = () => {
      const playPromise = video.play();
      if (playPromise?.catch) {
        playPromise.catch(() => {});
      }
    };

    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener('canplay', tryPlay, { once: true });
      video.load();
    }
  };

  const syncAllSectionVideos = () => {
    sectionVideos.forEach(syncSectionVideo);
  };

  syncAllSectionVideos();
  reduceMotion.addEventListener('change', syncAllSectionVideos);
}

const popup = document.getElementById('popup');
const openButtons = document.querySelectorAll('.header-button, .btn-open-popup');
const closeBtn = document.querySelector('.close-popup');
const forms = document.querySelectorAll('#joinForm, #contactForm');
const customSelects = document.querySelectorAll('.custom-select');

const openPopup = () => {
  if (!popup) return;
  popup.classList.add('active');
  document.body.classList.add('menu-open');
};

const closePopup = () => {
  if (!popup) return;
  popup.classList.remove('active');
  if (!document.querySelector('.header-menu.open')) {
    document.body.classList.remove('menu-open');
  }
};

openButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (headerMenu?.classList.contains('open')) closeMenu();
    openPopup();
  });
});

if (closeBtn) {
  closeBtn.addEventListener('click', closePopup);
}

if (popup) {
  popup.addEventListener('click', (e) => {
    if (e.target === popup) closePopup();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closePopup();
    closeMenu();
  }
});

forms.forEach((form) => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.reset();
    form.querySelectorAll('.custom-select').forEach((select) => {
      select.classList.remove('has-value', 'is-open');
      const valueEl = select.querySelector('.custom-select__value');
      if (valueEl) valueEl.textContent = '';
      const hidden = select.querySelector('input[type="hidden"]');
      if (hidden) hidden.value = '';
    });
    closePopup();
  });
});

const burger = document.querySelector('.burger');
const headerMenu = document.querySelector('.header-menu');
const headerLinks = document.querySelectorAll('a.header-link');
const menuOverlay = document.querySelector('.menu-overlay');
let menuClosing = false;

const openMenu = () => {
  if (menuClosing) return;
  headerMenu?.classList.add('open');
  menuOverlay?.classList.add('active');
  document.body.classList.add('menu-open');
  burger?.classList.add('is-active');
  burger?.setAttribute('aria-expanded', 'true');
  burger?.setAttribute('aria-label', 'Close menu');
};

const closeMenu = () => {
  if (!headerMenu?.classList.contains('open') || menuClosing) return;

  menuClosing = true;
  headerMenu.classList.remove('open');
  menuOverlay?.classList.remove('active');
  burger?.classList.remove('is-active');
  burger?.setAttribute('aria-expanded', 'false');
  burger?.setAttribute('aria-label', 'Toggle menu');

  const finishClose = (event) => {
    if (event && event.target !== headerMenu) return;
    if (!menuClosing) return;
    headerMenu.removeEventListener('transitionend', finishClose);
    if (!popup?.classList.contains('active')) {
      document.body.classList.remove('menu-open');
    }
    menuClosing = false;
  };

  headerMenu.addEventListener('transitionend', finishClose);
  window.setTimeout(finishClose, 500);
};

if (burger && headerMenu) {
  burger.addEventListener('click', () => {
    if (headerMenu.classList.contains('open')) closeMenu();
    else openMenu();
  });

  menuOverlay?.addEventListener('click', closeMenu);
  headerLinks.forEach((link) => link.addEventListener('click', closeMenu));
}

const navLinks = [...document.querySelectorAll('.header-link[data-nav-section]')];
const sectionIds = navLinks.map((link) => link.dataset.navSection).filter(Boolean);

const setActiveNav = (sectionId) => {
  navLinks.forEach((link) => {
    const isActive = link.dataset.navSection === sectionId;
    link.classList.toggle('is-active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
};

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const sectionId = link.dataset.navSection;
    const target = sectionId ? document.getElementById(sectionId) : null;
    if (!target) return;

    event.preventDefault();
    setActiveNav(sectionId);
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${sectionId}`);
  });
});

document.querySelector('.header-logo')?.addEventListener('click', (event) => {
  const target = document.getElementById('hero');
  if (!target) return;
  event.preventDefault();
  setActiveNav('hero');
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  history.replaceState(null, '', '#hero');
});

if (sectionIds.length) {
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visible[0]?.target?.id) {
        setActiveNav(visible[0].target.id);
      }
    },
    {
      rootMargin: '-30% 0px -55% 0px',
      threshold: [0.1, 0.25, 0.5],
    }
  );

  sections.forEach((section) => observer.observe(section));

  const hashId = window.location.hash.slice(1);
  if (hashId && sectionIds.includes(hashId)) {
    setActiveNav(hashId);
  }
}

document.querySelectorAll('[data-highlight-list]').forEach((list) => {
  const items = [...list.querySelectorAll('.highlight-list__item')];
  const indicator = list.querySelector('.highlight-list__indicator');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const moveIndicator = (item, instant = false) => {
    if (!indicator || !item) return;

    const y = item.offsetTop + (item.offsetHeight - indicator.offsetHeight) / 2;

    if (instant || reduceMotion.matches) {
      const prev = indicator.style.transition;
      indicator.style.transition = 'none';
      list.style.setProperty('--hl-y', `${y}px`);
      // Force reflow so the next transition still animates
      void indicator.offsetHeight;
      indicator.style.transition = prev;
      return;
    }

    list.style.setProperty('--hl-y', `${y}px`);
  };

  const setActive = (item, instant = false) => {
    items.forEach((other) => {
      const active = other === item;
      other.classList.toggle('is-active', active);
      other.setAttribute('aria-pressed', String(active));
    });
    moveIndicator(item, instant);
  };

  const initial = items.find((item) => item.classList.contains('is-active')) || items[0];
  if (initial) setActive(initial, true);

  items.forEach((item) => {
    item.addEventListener('click', () => {
      if (item.classList.contains('is-active')) return;
      setActive(item);
    });
  });

  window.addEventListener('resize', () => {
    const active = items.find((item) => item.classList.contains('is-active'));
    if (active) moveIndicator(active, true);
  });
});

document.querySelectorAll('[data-accordion]').forEach((accordion) => {
  const items = [...accordion.querySelectorAll('.acc-item')];
  const firstItem = items[0];

  const setOpenItem = (target) => {
    items.forEach((item) => {
      const isTarget = item === target;
      item.classList.toggle('is-open', isTarget);
      item.querySelector('.acc-item__header')?.setAttribute('aria-expanded', String(isTarget));
    });
  };

  if (firstItem) setOpenItem(firstItem);

  items.forEach((item) => {
    const trigger = item.querySelector('.acc-item__header');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      if (item.classList.contains('is-open')) {
        if (item === firstItem) return;
        setOpenItem(firstItem);
        return;
      }

      setOpenItem(item);
    });
  });
});

customSelects.forEach((customSelect) => {
  const trigger = customSelect.querySelector('.custom-select__trigger');
  const hiddenInput = customSelect.querySelector('input[type="hidden"]');
  const valueEl = customSelect.querySelector('.custom-select__value');
  const options = customSelect.querySelectorAll('.custom-select__options li');

  if (!trigger || !hiddenInput || !valueEl) return;

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    customSelects.forEach((other) => {
      if (other !== customSelect) {
        other.classList.remove('is-open');
        other.querySelector('.custom-select__trigger')?.setAttribute('aria-expanded', 'false');
      }
    });
    const isOpen = customSelect.classList.toggle('is-open');
    trigger.setAttribute('aria-expanded', String(isOpen));
  });

  options.forEach((option) => {
    option.addEventListener('click', () => {
      hiddenInput.value = option.dataset.value || '';
      valueEl.textContent = option.textContent.trim();
      customSelect.classList.add('has-value');
      customSelect.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      options.forEach((item) => item.classList.remove('is-selected'));
      option.classList.add('is-selected');
    });
  });
});

document.addEventListener('click', () => {
  customSelects.forEach((customSelect) => {
    customSelect.classList.remove('is-open');
    customSelect.querySelector('.custom-select__trigger')?.setAttribute('aria-expanded', 'false');
  });
});

document.querySelectorAll('[data-back-to-top]').forEach((btn) => {
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

document.querySelectorAll('[data-policy-toc]').forEach((toc) => {
  const links = [...toc.querySelectorAll('a[href^="#"]')];
  const sections = links
    .map((link) => document.getElementById(link.getAttribute('href').slice(1)))
    .filter(Boolean);

  if (!sections.length) return;

  const setActive = (id) => {
    links.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]?.target?.id) {
        setActive(visible[0].target.id);
      }
    },
    { rootMargin: '-20% 0px -60% 0px', threshold: [0.1, 0.35, 0.6] }
  );

  sections.forEach((section) => observer.observe(section));
});
