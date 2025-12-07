class DetailsDisclosure extends HTMLElement {
  constructor() {
    super();
    this.mainDetailsToggle = this.querySelector('details');
    this.content = this.mainDetailsToggle.querySelector('summary').nextElementSibling;

    this.mainDetailsToggle.addEventListener('focusout', this.onFocusOut.bind(this));
    this.mainDetailsToggle.addEventListener('toggle', this.onToggle.bind(this));
  }

  onFocusOut() {
    setTimeout(() => {
      if (!this.contains(document.activeElement)) this.close();
    });
  }

  onToggle() {
    if (!this.animations) this.animations = this.content.getAnimations();

    if (this.mainDetailsToggle.hasAttribute('open')) {
      this.animations.forEach((animation) => animation.play());
    } else {
      this.animations.forEach((animation) => animation.cancel());
    }
  }

  close() {
    this.mainDetailsToggle.removeAttribute('open');
    this.mainDetailsToggle.querySelector('summary').setAttribute('aria-expanded', false);
  }
}

customElements.define('details-disclosure', DetailsDisclosure);

class HeaderMenu extends DetailsDisclosure {
  constructor() {
    super();
    this.header = document.querySelector('.header-wrapper');
    this.summary = this.mainDetailsToggle.querySelector('summary');
    this.mql = window.matchMedia('(min-width: 990px)');
    this.enterHandler = this.onMouseEnter.bind(this);
    this.leaveHandler = this.onMouseLeave.bind(this);
    this.mediaChangeHandler = this.onMediaChange.bind(this);
    this.onMediaChange();
    this.mql.addEventListener('change', this.mediaChangeHandler);
  }

  onToggle() {
    if (!this.header) return;
    this.header.preventHide = this.mainDetailsToggle.open;

    if (document.documentElement.style.getPropertyValue('--header-bottom-position-desktop') !== '') return;
    document.documentElement.style.setProperty(
      '--header-bottom-position-desktop',
      `${Math.floor(this.header.getBoundingClientRect().bottom)}px`
    );
  }

  onMouseEnter() {
    if (!this.mql.matches) return;
    this.mainDetailsToggle.setAttribute('open', '');
    this.summary.setAttribute('aria-expanded', true);
  }

  onMouseLeave() {
    if (!this.mql.matches) return;
    this.close();
  }

  onMediaChange() {
    if (this.mql.matches) {
      this.addEventListener('mouseenter', this.enterHandler);
      this.addEventListener('mouseleave', this.leaveHandler);
    } else {
      this.removeEventListener('mouseenter', this.enterHandler);
      this.removeEventListener('mouseleave', this.leaveHandler);
    }
  }
}

customElements.define('header-menu', HeaderMenu);
