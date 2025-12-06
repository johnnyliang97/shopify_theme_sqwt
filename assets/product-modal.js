if (!customElements.get('product-modal')) {
  customElements.define(
    'product-modal',
    class ProductModal extends ModalDialog {
      constructor() {
        super();
      }

      hide() {
        super.hide();
      }

      show(opener) {
        super.show(opener);
        this.showActiveMedia();
      }

      showActiveMedia() {
        this.querySelectorAll(
          `[data-media-id]:not([data-media-id="${this.openedBy.getAttribute('data-media-id')}"])`
        ).forEach((element) => {
          element.classList.remove('active');
        });
        const activeMedia = this.querySelector(`[data-media-id="${this.openedBy.getAttribute('data-media-id')}"]`);
        const activeMediaTemplate = activeMedia.querySelector('template');
        const activeMediaContent = activeMediaTemplate ? activeMediaTemplate.content : null;
        activeMedia.classList.add('active');
        activeMedia.scrollIntoView();

        const container = this.querySelector('[role="document"]');
        container.scrollLeft = (activeMedia.width - container.clientWidth) / 2;

        if (
          activeMedia.nodeName == 'DEFERRED-MEDIA' &&
          activeMediaContent &&
          activeMediaContent.querySelector('.js-youtube')
        )
          activeMedia.loadContent();

        this.enableMobilePinchZoom(activeMedia);
      }

      enableMobilePinchZoom(element) {
        try {
          if (!window.matchMedia('(max-width: 749px)').matches) return;
          if (!element) return;
          const target = element.nodeName === 'IMG' ? element : element.querySelector('img');
          if (!target) return;
          target.style.transition = 'transform 150ms ease';
          target.style.transformOrigin = 'center center';
          target.style.willChange = 'transform';

          let startDistance = null;
          let pointers = new Map();

          const reset = () => {
            startDistance = null;
            target.style.transform = 'scale(1)';
          };

          const onPointerDown = (e) => {
            if (e.pointerType !== 'touch') return;
            target.setPointerCapture && target.setPointerCapture(e.pointerId);
            pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
            if (pointers.size === 2) {
              const pts = Array.from(pointers.values());
              startDistance = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
            }
          };

          const onPointerMove = (e) => {
            if (!pointers.has(e.pointerId)) return;
            pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
            if (pointers.size === 2 && startDistance) {
              const pts = Array.from(pointers.values());
              const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
              const scale = Math.max(1, Math.min(3, dist / startDistance));
              target.style.transform = `scale(${scale})`;
            }
          };

          const onPointerUp = (e) => {
            pointers.delete(e.pointerId);
            if (pointers.size < 2) {
              reset();
            }
          };

          const onGestureStart = (e) => {
            e.preventDefault();
          };
          const onGestureChange = (e) => {
            const scale = Math.max(1, Math.min(3, e.scale));
            target.style.transform = `scale(${scale})`;
          };
          const onGestureEnd = () => reset();

          if (target._pinchHandlers) {
            const h = target._pinchHandlers;
            target.removeEventListener('pointerdown', h.down);
            target.removeEventListener('pointermove', h.move);
            target.removeEventListener('pointerup', h.up);
            target.removeEventListener('pointercancel', h.up);
            target.removeEventListener('gesturestart', h.gstart);
            target.removeEventListener('gesturechange', h.gchange);
            target.removeEventListener('gestureend', h.gend);
          }
          target._pinchHandlers = {
            down: onPointerDown,
            move: onPointerMove,
            up: onPointerUp,
            gstart: onGestureStart,
            gchange: onGestureChange,
            gend: onGestureEnd,
          };

          target.addEventListener('pointerdown', onPointerDown, { passive: true });
          target.addEventListener('pointermove', onPointerMove, { passive: true });
          target.addEventListener('pointerup', onPointerUp);
          target.addEventListener('pointercancel', onPointerUp);
          target.addEventListener('gesturestart', onGestureStart);
          target.addEventListener('gesturechange', onGestureChange);
          target.addEventListener('gestureend', onGestureEnd);
        } catch (e) {}
      }
    }
  );
}
