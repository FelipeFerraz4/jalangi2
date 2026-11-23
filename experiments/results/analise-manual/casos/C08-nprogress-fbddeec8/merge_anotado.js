/*! NProgress (c) 2013, Rico Sta. Cruz
 *  http://ricostacruz.com/nprogress */

;(function(factory) {

  if (typeof module === 'function') {
    module.exports = factory();                                                                   // [R]
  } else if (typeof define === 'function' && define.amd) {
    define(factory);                                                                              // [R]
  } else {
    this.NProgress = factory();                                                                   // [R]
  }

})(function() {                                                                                   // [R]
  var NProgress = {};                                                                             // ◀ #1 DF: produz (R) (herdou R pela chamada na linha 11) → L 186

  NProgress.version = '0.1.2';

  var Settings = NProgress.settings = {
    minimum: 0.08,
    easing: 'ease',
    positionUsing: '',
    speed: 200,
    trickle: true,
    trickleRate: 0.02,
    trickleSpeed: 800,
    showSpinner: true,
    barSelector: '[role="bar"]',                                                                  // [R]
    spinnerSelector: '[role="spinner"]',                                                          // [R]
    template: '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
  };

  /**
   * Updates configuration.
   *
   *     NProgress.configure({
   *       minimum: 0.1
   *     });
   */
  NProgress.configure = function(options) {
    var key, value;                                                                               // [R]
    for (key in options) {                                                                        // [R]
      value = options[key];                                                                       // [R]
      if (value !== undefined && options.hasOwnProperty(key)) Settings[key] = value;              // [R]
    }                                                                                             // [R]
                                                                                                  // [R]
    return this;
  };

  /**
   * Last number.
   */

  NProgress.status = null;

  /**
   * Sets the progress bar status, where `n` is a number from `0.0` to `1.0`.
   *
   *     NProgress.set(0.4);
   *     NProgress.set(1.0);
   */

  NProgress.set = function(n) {
    var started = NProgress.isStarted();

    n = clamp(n, Settings.minimum, 1);
    NProgress.status = (n === 1 ? null : n);

    var progress = NProgress.render(!started),                                                    // [R]
        bar      = progress.querySelector(Settings.barSelector),                                  // [R]
        speed    = Settings.speed,
        ease     = Settings.easing;

    progress.offsetWidth; /* Repaint */                                                           // [R]

    queue(function(next) {                                                                        // [R]
      // Set positionUsing if it hasn't already been set
      if (Settings.positionUsing === '') Settings.positionUsing = NProgress.getPositioningCSS();

      // Add transition
      css(bar, barPositionCSS(n, speed, ease));                                                   // [R]

      if (n === 1) {
        // Fade out
        css(progress, {                                                                           // [R]
          transition: 'none',                                                                     // [R]
          opacity: 1                                                                              // [R]
        });                                                                                       // [R]
        progress.offsetWidth; /* Repaint */                                                       // [R]

        setTimeout(function() {
          css(progress, {                                                                         // [R]
            transition: 'all ' + speed + 'ms linear',                                             // [R]
            opacity: 0                                                                            // [R]
          });                                                                                     // [R]
          setTimeout(function() {
            NProgress.remove();
            next();
          }, speed);
        }, speed);
      } else {
        setTimeout(next, speed);
      }
    });

    return this;
  };

  NProgress.isStarted = function() {
    return typeof NProgress.status === 'number';
  };

  /**
   * Shows the progress bar.
   * This is the same as setting the status to 0%, except that it doesn't go backwards.
   *
   *     NProgress.start();
   *
   */
  NProgress.start = function() {
    if (!NProgress.status) NProgress.set(0);

    var work = function() {
      setTimeout(function() {
        if (!NProgress.status) return;
        NProgress.trickle();
        work();
      }, Settings.trickleSpeed);
    };

    if (Settings.trickle) work();

    return this;
  };

  /**
   * Hides the progress bar.
   * This is the *sort of* the same as setting the status to 100%, with the
   * difference being `done()` makes some placebo effect of some realistic motion.
   *
   *     NProgress.done();
   *
   * If `true` is passed, it will show the progress bar even if its hidden.
   *
   *     NProgress.done(true);
   */

  NProgress.done = function(force) {
    if (!force && !NProgress.status) return this;

    return NProgress.inc(0.3 + 0.5 * Math.random()).set(1);
  };

  /**
   * Increments by a random amount.
   */

  NProgress.inc = function(amount) {
    var n = NProgress.status;

    if (!n) {
      return NProgress.start();
    } else {
      if (typeof amount !== 'number') {
        amount = (1 - n) * clamp(Math.random() * n, 0.1, 0.95);
      }

      n = clamp(n + amount, 0, 0.994);
      return NProgress.set(n);
    }
  };

  NProgress.trickle = function() {
    return NProgress.inc(Math.random() * Settings.trickleRate);
  };

  /**                                                                                             // [L]
   * Waits for all supplied jQuery promises and                                                   // [L]
   * increases the progress as the promises resolve.                                              // [L]
   *                                                                                              // [L]
   * @param $promise jQUery Promise                                                               // [L]
   */                                                                                             // [L]
  (function() {                                                                                   // [L]
    var initial = 0, current = 0;                                                                 // [L]
                                                                                                  // [L]
    NProgress.promise = function($promise) {                                                      // [L]  ◀ #1 DF: consome (L) ← R 15
      if (!$promise || $promise.state() == "resolved") {                                          // [L]
        return this;                                                                              // [L]
      }                                                                                           // [L]
                                                                                                  // [L]
      if (current == 0) {                                                                         // [L]
        NProgress.start();                                                                        // [L]
      }                                                                                           // [L]
                                                                                                  // [L]
      initial++;                                                                                  // [L]
      current++;                                                                                  // [L]
                                                                                                  // [L]
      $promise.always(function() {                                                                // [L]
        current--;                                                                                // [L]
        if (current == 0) {                                                                       // [L]
            initial = 0;                                                                          // [L]
            NProgress.done();                                                                     // [L]
        } else {                                                                                  // [L]
            NProgress.set((initial - current) / initial);                                         // [L]
        }                                                                                         // [L]
      });                                                                                         // [L]
                                                                                                  // [L]
      return this;                                                                                // [L]
    };                                                                                            // [L]
                                                                                                  // [L]
  })();                                                                                           // [L]
                                                                                                  // [L]
  /**
   * (Internal) renders the progress bar markup based on the `template`
   * setting.
   */

  NProgress.render = function(fromStart) {
    if (NProgress.isRendered()) return document.getElementById('nprogress');                      // [R]

    addClass(document.documentElement, 'nprogress-busy');                                         // [R]
    
    var progress = document.createElement('div');                                                 // [R]
    progress.id = 'nprogress';                                                                    // [R]
    progress.innerHTML = Settings.template;                                                       // [R]

    var bar      = progress.querySelector(Settings.barSelector),                                  // [R]
        perc     = fromStart ? '-100' : toBarPerc(NProgress.status || 0),                         // [R]
        spinner;                                                                                  // [R]
                                                                                                  // [R]
    css(bar, {                                                                                    // [R]
      transition: 'all 0 linear',
      transform: 'translate3d(' + perc + '%,0,0)'
    });

    if (!Settings.showSpinner) {                                                                  // [R]
      spinner = progress.querySelector(Settings.spinnerSelector);                                 // [R]
      spinner && removeElement(spinner);                                                          // [R]
    }                                                                                             // [R]

    document.body.appendChild(progress);                                                          // [R]
    return progress;                                                                              // [R]
  };

  /**
   * Removes the element. Opposite of render().
   */

  NProgress.remove = function() {
    removeClass(document.documentElement, 'nprogress-busy');                                      // [R]
    var progress = document.getElementById('nprogress');                                          // [R]
    progress && removeElement(progress);                                                          // [R]
  };

  /**
   * Checks if the progress bar is rendered.
   */

  NProgress.isRendered = function() {
    return !!document.getElementById('nprogress');                                                // [R]
  };

  /**
   * Determine which positioning CSS rule to use.
   */

  NProgress.getPositioningCSS = function() {
    // Sniff on document.body.style
    var bodyStyle = document.body.style;

    // Sniff prefixes
    var vendorPrefix = ('WebkitTransform' in bodyStyle) ? 'Webkit' :
                       ('MozTransform' in bodyStyle) ? 'Moz' :
                       ('msTransform' in bodyStyle) ? 'ms' :
                       ('OTransform' in bodyStyle) ? 'O' : '';

    if (vendorPrefix + 'Perspective' in bodyStyle) {
      // Modern browsers with 3D support, e.g. Webkit, IE10
      return 'translate3d';
    } else if (vendorPrefix + 'Transform' in bodyStyle) {
      // Browsers without 3D support, e.g. IE9
      return 'translate';
    } else {
      // Browsers without translate() support, e.g. IE7-8
      return 'margin';
    }
  };

  /**
   * Helpers
   */

  function clamp(n, min, max) {
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }

  /**
   * (Internal) converts a percentage (`0..1`) to a bar translateX
   * percentage (`-100%..0%`).
   */

  function toBarPerc(n) {
    return (-1 + n) * 100;
  }


  /**
   * (Internal) returns the correct CSS for changing the bar's
   * position given an n percentage, and speed and ease from Settings
   */

  function barPositionCSS(n, speed, ease) {
    var barCSS;

    if (Settings.positionUsing === 'translate3d') {
      barCSS = { transform: 'translate3d('+toBarPerc(n)+'%,0,0)' };
    } else if (Settings.positionUsing === 'translate') {
      barCSS = { transform: 'translate('+toBarPerc(n)+'%,0)' };
    } else {
      barCSS = { 'margin-left': toBarPerc(n)+'%' };
    }

    barCSS.transition = 'all '+speed+'ms '+ease;

    return barCSS;
  }

  /**                                                                                             // [R]
   * (Internal) Queues a function to be executed.                                                 // [R]
   */                                                                                             // [R]
                                                                                                  // [R]
  var queue = (function() {                                                                       // [R]
    var pending = [];                                                                             // [R]
                                                                                                  // [R]
    function next() {                                                                             // [R]
      var fn = pending.shift();                                                                   // [R]
      if (fn) {                                                                                   // [R]
        fn(next);                                                                                 // [R]
      }                                                                                           // [R]
    }                                                                                             // [R]
                                                                                                  // [R]
    return function(fn) {                                                                         // [R]
      pending.push(fn);                                                                           // [R]
      if (pending.length == 1) next();                                                            // [R]
    };                                                                                            // [R]
  })();                                                                                           // [R]
                                                                                                  // [R]
  /**                                                                                             // [R]
   * (Internal) Applies css properties to an element, similar to the jQuery                       // [R]
   * css method.                                                                                  // [R]
   *                                                                                              // [R]
   * While this helper does assist with vendor prefixed property names, it                        // [R]
   * does not perform any manipulation of values prior to setting styles.                         // [R]
   */                                                                                             // [R]
                                                                                                  // [R]
  var css = (function() {                                                                         // [R]
    var cssPrefixes = [ 'Webkit', 'O', 'Moz', 'ms' ],                                             // [R]
        cssProps    = {};                                                                         // [R]
                                                                                                  // [R]
    function camelCase(string) {                                                                  // [R]
      return string.replace(/^-ms-/, 'ms-').replace(/-([\da-z])/gi, function(match, letter) {     // [R]
        return letter.toUpperCase();                                                              // [R]
      });                                                                                         // [R]
    }                                                                                             // [R]
                                                                                                  // [R]
    function getVendorProp(name) {                                                                // [R]
      var style = document.body.style;                                                            // [R]
      if (name in style) return name;                                                             // [R]
                                                                                                  // [R]
      var i = cssPrefixes.length,                                                                 // [R]
          capName = name.charAt(0).toUpperCase() + name.slice(1),                                 // [R]
          vendorName;                                                                             // [R]
      while (i--) {                                                                               // [R]
        vendorName = cssPrefixes[i] + capName;                                                    // [R]
        if (vendorName in style) return vendorName;                                               // [R]
      }                                                                                           // [R]
                                                                                                  // [R]
      return name;                                                                                // [R]
    }                                                                                             // [R]
                                                                                                  // [R]
    function getStyleProp(name) {                                                                 // [R]
      name = camelCase(name);                                                                     // [R]
      return cssProps[name] || (cssProps[name] = getVendorProp(name));                            // [R]
    }                                                                                             // [R]
                                                                                                  // [R]
    function applyCss(element, prop, value) {                                                     // [R]
      prop = getStyleProp(prop);                                                                  // [R]
      element.style[prop] = value;                                                                // [R]
    }                                                                                             // [R]
                                                                                                  // [R]
    return function(element, properties) {                                                        // [R]
      var args = arguments,                                                                       // [R]
          prop,                                                                                   // [R]
          value;                                                                                  // [R]
                                                                                                  // [R]
      if (args.length == 2) {                                                                     // [R]
        for (prop in properties) {                                                                // [R]
          value = properties[prop];                                                               // [R]
          if (value !== undefined && properties.hasOwnProperty(prop)) applyCss(element, prop, value);  // [R]
        }                                                                                         // [R]
      } else {                                                                                    // [R]
        applyCss(element, args[1], args[2]);                                                      // [R]
      }                                                                                           // [R]
    }                                                                                             // [R]
  })();                                                                                           // [R]
                                                                                                  // [R]
  /**                                                                                             // [R]
   * (Internal) Determines if an element or space separated list of class names contains a class name.  // [R]
   */                                                                                             // [R]
                                                                                                  // [R]
  function hasClass(element, name) {                                                              // [R]
    var list = typeof element == 'string' ? element : classList(element);                         // [R]
    return list.indexOf(' ' + name + ' ') >= 0;                                                   // [R]
  }                                                                                               // [R]
                                                                                                  // [R]
  /**                                                                                             // [R]
   * (Internal) Adds a class to an element.                                                       // [R]
   */                                                                                             // [R]
                                                                                                  // [R]
  function addClass(element, name) {                                                              // [R]
    var oldList = classList(element),                                                             // [R]
        newList = oldList + name;                                                                 // [R]
                                                                                                  // [R]
    if (hasClass(oldList, name)) return;                                                          // [R]
                                                                                                  // [R]
    // Trim the opening space.                                                                    // [R]
    element.className = newList.substring(1);                                                     // [R]
  }                                                                                               // [R]
                                                                                                  // [R]
  /**                                                                                             // [R]
   * (Internal) Removes a class from an element.                                                  // [R]
   */                                                                                             // [R]
                                                                                                  // [R]
  function removeClass(element, name) {                                                           // [R]
    var oldList = classList(element),                                                             // [R]
        newList;                                                                                  // [R]
                                                                                                  // [R]
    if (!hasClass(element, name)) return;                                                         // [R]
                                                                                                  // [R]
    // Replace the class name.                                                                    // [R]
    newList = oldList.replace(' ' + name + ' ', ' ');                                             // [R]
                                                                                                  // [R]
    // Trim the opening and closing spaces.                                                       // [R]
    element.className = newList.substring(1, newList.length - 1);                                 // [R]
  }                                                                                               // [R]
                                                                                                  // [R]
  /**                                                                                             // [R]
   * (Internal) Gets a space separated list of the class names on the element.                    // [R]
   * The list is wrapped with a single space on each end to facilitate finding                    // [R]
   * matches within the list.                                                                     // [R]
   */                                                                                             // [R]
                                                                                                  // [R]
  function classList(element) {                                                                   // [R]
    return (' ' + (element.className || '') + ' ').replace(/\s+/gi, ' ');                         // [R]
  }                                                                                               // [R]
                                                                                                  // [R]
  /**                                                                                             // [R]
   * (Internal) Removes an element from the DOM.                                                  // [R]
   */                                                                                             // [R]
                                                                                                  // [R]
  function removeElement(element) {                                                               // [R]
    element && element.parentNode && element.parentNode.removeChild(element);                     // [R]
  }                                                                                               // [R]
                                                                                                  // [R]
  return NProgress;
});


// ─────────────────────────────────────────────────────────────────────────────
// Legenda (merge_anotado.js; a numeração das linhas é a mesma do merge.js e do README):
//   [L] / [R]   linha alterada por aquele lado        [L=R]  igual nos dois lados (o mapa conta como L)
//   ◀ #n        papel da linha no conflito n do README.md; "herdou" = a linha não foi alterada por aquele
//               lado e pegou a branch da chamada indicada (regra interprocedural da análise)
