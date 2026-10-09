/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ye = globalThis, Ne = ye.ShadowRoot && (ye.ShadyCSS === void 0 || ye.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, De = Symbol(), Fe = /* @__PURE__ */ new WeakMap();
let dt = class {
  constructor(t, i, r) {
    if (this._$cssResult$ = !0, r !== De) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = i;
  }
  get styleSheet() {
    let t = this.o;
    const i = this.t;
    if (Ne && t === void 0) {
      const r = i !== void 0 && i.length === 1;
      r && (t = Fe.get(i)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), r && Fe.set(i, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const $t = (e) => new dt(typeof e == "string" ? e : e + "", void 0, De), D = (e, ...t) => {
  const i = e.length === 1 ? e[0] : t.reduce((r, s, n) => r + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + e[n + 1], e[0]);
  return new dt(i, e, De);
}, wt = (e, t) => {
  if (Ne) e.adoptedStyleSheets = t.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
  else for (const i of t) {
    const r = document.createElement("style"), s = ye.litNonce;
    s !== void 0 && r.setAttribute("nonce", s), r.textContent = i.cssText, e.appendChild(r);
  }
}, Ue = Ne ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let i = "";
  for (const r of t.cssRules) i += r.cssText;
  return $t(i);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: xt, defineProperty: kt, getOwnPropertyDescriptor: Et, getOwnPropertyNames: St, getOwnPropertySymbols: At, getPrototypeOf: Ct } = Object, xe = globalThis, He = xe.trustedTypes, Pt = He ? He.emptyScript : "", Ot = xe.reactiveElementPolyfillSupport, ce = (e, t) => e, be = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? Pt : null;
      break;
    case Object:
    case Array:
      e = e == null ? e : JSON.stringify(e);
  }
  return e;
}, fromAttribute(e, t) {
  let i = e;
  switch (t) {
    case Boolean:
      i = e !== null;
      break;
    case Number:
      i = e === null ? null : Number(e);
      break;
    case Object:
    case Array:
      try {
        i = JSON.parse(e);
      } catch {
        i = null;
      }
  }
  return i;
} }, Re = (e, t) => !xt(e, t), Be = { attribute: !0, type: String, converter: be, reflect: !1, useDefault: !1, hasChanged: Re };
Symbol.metadata ??= Symbol("metadata"), xe.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let ee = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, i = Be) {
    if (i.state && (i.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((i = Object.create(i)).wrapped = !0), this.elementProperties.set(t, i), !i.noAccessor) {
      const r = Symbol(), s = this.getPropertyDescriptor(t, r, i);
      s !== void 0 && kt(this.prototype, t, s);
    }
  }
  static getPropertyDescriptor(t, i, r) {
    const { get: s, set: n } = Et(this.prototype, t) ?? { get() {
      return this[i];
    }, set(o) {
      this[i] = o;
    } };
    return { get: s, set(o) {
      const l = s?.call(this);
      n?.call(this, o), this.requestUpdate(t, l, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? Be;
  }
  static _$Ei() {
    if (this.hasOwnProperty(ce("elementProperties"))) return;
    const t = Ct(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(ce("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(ce("properties"))) {
      const i = this.properties, r = [...St(i), ...At(i)];
      for (const s of r) this.createProperty(s, i[s]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const i = litPropertyMetadata.get(t);
      if (i !== void 0) for (const [r, s] of i) this.elementProperties.set(r, s);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [i, r] of this.elementProperties) {
      const s = this._$Eu(i, r);
      s !== void 0 && this._$Eh.set(s, i);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const i = [];
    if (Array.isArray(t)) {
      const r = new Set(t.flat(1 / 0).reverse());
      for (const s of r) i.unshift(Ue(s));
    } else t !== void 0 && i.push(Ue(t));
    return i;
  }
  static _$Eu(t, i) {
    const r = i.attribute;
    return r === !1 ? void 0 : typeof r == "string" ? r : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), i = this.constructor.elementProperties;
    for (const r of i.keys()) this.hasOwnProperty(r) && (t.set(r, this[r]), delete this[r]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return wt(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, i, r) {
    this._$AK(t, r);
  }
  _$ET(t, i) {
    const r = this.constructor.elementProperties.get(t), s = this.constructor._$Eu(t, r);
    if (s !== void 0 && r.reflect === !0) {
      const n = (r.converter?.toAttribute !== void 0 ? r.converter : be).toAttribute(i, r.type);
      this._$Em = t, n == null ? this.removeAttribute(s) : this.setAttribute(s, n), this._$Em = null;
    }
  }
  _$AK(t, i) {
    const r = this.constructor, s = r._$Eh.get(t);
    if (s !== void 0 && this._$Em !== s) {
      const n = r.getPropertyOptions(s), o = typeof n.converter == "function" ? { fromAttribute: n.converter } : n.converter?.fromAttribute !== void 0 ? n.converter : be;
      this._$Em = s;
      const l = o.fromAttribute(i, n.type);
      this[s] = l ?? this._$Ej?.get(s) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, i, r, s = !1, n) {
    if (t !== void 0) {
      const o = this.constructor;
      if (s === !1 && (n = this[t]), r ??= o.getPropertyOptions(t), !((r.hasChanged ?? Re)(n, i) || r.useDefault && r.reflect && n === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, r)))) return;
      this.C(t, i, r);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, i, { useDefault: r, reflect: s, wrapped: n }, o) {
    r && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, o ?? i ?? this[t]), n !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || r || (i = void 0), this._$AL.set(t, i)), s === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (i) {
      Promise.reject(i);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [s, n] of this._$Ep) this[s] = n;
        this._$Ep = void 0;
      }
      const r = this.constructor.elementProperties;
      if (r.size > 0) for (const [s, n] of r) {
        const { wrapped: o } = n, l = this[s];
        o !== !0 || this._$AL.has(s) || l === void 0 || this.C(s, void 0, n, l);
      }
    }
    let t = !1;
    const i = this._$AL;
    try {
      t = this.shouldUpdate(i), t ? (this.willUpdate(i), this._$EO?.forEach((r) => r.hostUpdate?.()), this.update(i)) : this._$EM();
    } catch (r) {
      throw t = !1, this._$EM(), r;
    }
    t && this._$AE(i);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((i) => i.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((i) => this._$ET(i, this[i])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
ee.elementStyles = [], ee.shadowRootOptions = { mode: "open" }, ee[ce("elementProperties")] = /* @__PURE__ */ new Map(), ee[ce("finalized")] = /* @__PURE__ */ new Map(), Ot?.({ ReactiveElement: ee }), (xe.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ze = globalThis, Ve = (e) => e, $e = ze.trustedTypes, Ke = $e ? $e.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, ct = "$lit$", B = `lit$${Math.random().toFixed(9).slice(2)}$`, pt = "?" + B, Mt = `<${pt}>`, Z = document, ue = () => Z.createComment(""), _e = (e) => e === null || typeof e != "object" && typeof e != "function", Le = Array.isArray, Tt = (e) => Le(e) || typeof e?.[Symbol.iterator] == "function", Ee = `[ 	
\f\r]`, he = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, qe = /-->/g, We = />/g, G = RegExp(`>|${Ee}(?:([^\\s"'>=/]+)(${Ee}*=${Ee}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ge = /'/g, Ye = /"/g, ut = /^(?:script|style|textarea|title)$/i, It = (e) => (t, ...i) => ({ _$litType$: e, strings: t, values: i }), a = It(1), X = Symbol.for("lit-noChange"), d = Symbol.for("lit-nothing"), Je = /* @__PURE__ */ new WeakMap(), J = Z.createTreeWalker(Z, 129);
function _t(e, t) {
  if (!Le(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Ke !== void 0 ? Ke.createHTML(t) : t;
}
const Nt = (e, t) => {
  const i = e.length - 1, r = [];
  let s, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = he;
  for (let l = 0; l < i; l++) {
    const h = e[l];
    let p, y, u = -1, m = 0;
    for (; m < h.length && (o.lastIndex = m, y = o.exec(h), y !== null); ) m = o.lastIndex, o === he ? y[1] === "!--" ? o = qe : y[1] !== void 0 ? o = We : y[2] !== void 0 ? (ut.test(y[2]) && (s = RegExp("</" + y[2], "g")), o = G) : y[3] !== void 0 && (o = G) : o === G ? y[0] === ">" ? (o = s ?? he, u = -1) : y[1] === void 0 ? u = -2 : (u = o.lastIndex - y[2].length, p = y[1], o = y[3] === void 0 ? G : y[3] === '"' ? Ye : Ge) : o === Ye || o === Ge ? o = G : o === qe || o === We ? o = he : (o = G, s = void 0);
    const g = o === G && e[l + 1].startsWith("/>") ? " " : "";
    n += o === he ? h + Mt : u >= 0 ? (r.push(p), h.slice(0, u) + ct + h.slice(u) + B + g) : h + B + (u === -2 ? l : g);
  }
  return [_t(e, n + (e[i] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
};
class me {
  constructor({ strings: t, _$litType$: i }, r) {
    let s;
    this.parts = [];
    let n = 0, o = 0;
    const l = t.length - 1, h = this.parts, [p, y] = Nt(t, i);
    if (this.el = me.createElement(p, r), J.currentNode = this.el.content, i === 2 || i === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (s = J.nextNode()) !== null && h.length < l; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const u of s.getAttributeNames()) if (u.endsWith(ct)) {
          const m = y[o++], g = s.getAttribute(u).split(B), $ = /([.?@])?(.*)/.exec(m);
          h.push({ type: 1, index: n, name: $[2], strings: g, ctor: $[1] === "." ? Rt : $[1] === "?" ? zt : $[1] === "@" ? Lt : ke }), s.removeAttribute(u);
        } else u.startsWith(B) && (h.push({ type: 6, index: n }), s.removeAttribute(u));
        if (ut.test(s.tagName)) {
          const u = s.textContent.split(B), m = u.length - 1;
          if (m > 0) {
            s.textContent = $e ? $e.emptyScript : "";
            for (let g = 0; g < m; g++) s.append(u[g], ue()), J.nextNode(), h.push({ type: 2, index: ++n });
            s.append(u[m], ue());
          }
        }
      } else if (s.nodeType === 8) if (s.data === pt) h.push({ type: 2, index: n });
      else {
        let u = -1;
        for (; (u = s.data.indexOf(B, u + 1)) !== -1; ) h.push({ type: 7, index: n }), u += B.length - 1;
      }
      n++;
    }
  }
  static createElement(t, i) {
    const r = Z.createElement("template");
    return r.innerHTML = t, r;
  }
}
function se(e, t, i = e, r) {
  if (t === X) return t;
  let s = r !== void 0 ? i._$Co?.[r] : i._$Cl;
  const n = _e(t) ? void 0 : t._$litDirective$;
  return s?.constructor !== n && (s?._$AO?.(!1), n === void 0 ? s = void 0 : (s = new n(e), s._$AT(e, i, r)), r !== void 0 ? (i._$Co ??= [])[r] = s : i._$Cl = s), s !== void 0 && (t = se(e, s._$AS(e, t.values), s, r)), t;
}
class Dt {
  constructor(t, i) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = i;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: i }, parts: r } = this._$AD, s = (t?.creationScope ?? Z).importNode(i, !0);
    J.currentNode = s;
    let n = J.nextNode(), o = 0, l = 0, h = r[0];
    for (; h !== void 0; ) {
      if (o === h.index) {
        let p;
        h.type === 2 ? p = new ne(n, n.nextSibling, this, t) : h.type === 1 ? p = new h.ctor(n, h.name, h.strings, this, t) : h.type === 6 && (p = new jt(n, this, t)), this._$AV.push(p), h = r[++l];
      }
      o !== h?.index && (n = J.nextNode(), o++);
    }
    return J.currentNode = Z, s;
  }
  p(t) {
    let i = 0;
    for (const r of this._$AV) r !== void 0 && (r.strings !== void 0 ? (r._$AI(t, r, i), i += r.strings.length - 2) : r._$AI(t[i])), i++;
  }
}
class ne {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, i, r, s) {
    this.type = 2, this._$AH = d, this._$AN = void 0, this._$AA = t, this._$AB = i, this._$AM = r, this.options = s, this._$Cv = s?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const i = this._$AM;
    return i !== void 0 && t?.nodeType === 11 && (t = i.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, i = this) {
    t = se(this, t, i), _e(t) ? t === d || t == null || t === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : t !== this._$AH && t !== X && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Tt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== d && _e(this._$AH) ? this._$AA.nextSibling.data = t : this.T(Z.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: i, _$litType$: r } = t, s = typeof r == "number" ? this._$AC(t) : (r.el === void 0 && (r.el = me.createElement(_t(r.h, r.h[0]), this.options)), r);
    if (this._$AH?._$AD === s) this._$AH.p(i);
    else {
      const n = new Dt(s, this), o = n.u(this.options);
      n.p(i), this.T(o), this._$AH = n;
    }
  }
  _$AC(t) {
    let i = Je.get(t.strings);
    return i === void 0 && Je.set(t.strings, i = new me(t)), i;
  }
  k(t) {
    Le(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let r, s = 0;
    for (const n of t) s === i.length ? i.push(r = new ne(this.O(ue()), this.O(ue()), this, this.options)) : r = i[s], r._$AI(n), s++;
    s < i.length && (this._$AR(r && r._$AB.nextSibling, s), i.length = s);
  }
  _$AR(t = this._$AA.nextSibling, i) {
    for (this._$AP?.(!1, !0, i); t !== this._$AB; ) {
      const r = Ve(t).nextSibling;
      Ve(t).remove(), t = r;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class ke {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, i, r, s, n) {
    this.type = 1, this._$AH = d, this._$AN = void 0, this.element = t, this.name = i, this._$AM = s, this.options = n, r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String()), this.strings = r) : this._$AH = d;
  }
  _$AI(t, i = this, r, s) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) t = se(this, t, i, 0), o = !_e(t) || t !== this._$AH && t !== X, o && (this._$AH = t);
    else {
      const l = t;
      let h, p;
      for (t = n[0], h = 0; h < n.length - 1; h++) p = se(this, l[r + h], i, h), p === X && (p = this._$AH[h]), o ||= !_e(p) || p !== this._$AH[h], p === d ? t = d : t !== d && (t += (p ?? "") + n[h + 1]), this._$AH[h] = p;
    }
    o && !s && this.j(t);
  }
  j(t) {
    t === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Rt extends ke {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === d ? void 0 : t;
  }
}
class zt extends ke {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== d);
  }
}
class Lt extends ke {
  constructor(t, i, r, s, n) {
    super(t, i, r, s, n), this.type = 5;
  }
  _$AI(t, i = this) {
    if ((t = se(this, t, i, 0) ?? d) === X) return;
    const r = this._$AH, s = t === d && r !== d || t.capture !== r.capture || t.once !== r.once || t.passive !== r.passive, n = t !== d && (r === d || s);
    s && this.element.removeEventListener(this.name, this, r), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class jt {
  constructor(t, i, r) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    se(this, t);
  }
}
const Ft = { I: ne }, Ut = ze.litHtmlPolyfillSupport;
Ut?.(me, ne), (ze.litHtmlVersions ??= []).push("3.3.3");
const Ht = (e, t, i) => {
  const r = i?.renderBefore ?? t;
  let s = r._$litPart$;
  if (s === void 0) {
    const n = i?.renderBefore ?? null;
    r._$litPart$ = s = new ne(t.insertBefore(ue(), n), n, void 0, i ?? {});
  }
  return s._$AI(e), s;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const je = globalThis;
let C = class extends ee {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const i = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Ht(i, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return X;
  }
};
C._$litElement$ = !0, C.finalized = !0, je.litElementHydrateSupport?.({ LitElement: C });
const Bt = je.litElementPolyfillSupport;
Bt?.({ LitElement: C });
(je.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const z = (e) => (t, i) => {
  i !== void 0 ? i.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Vt = { attribute: !0, type: String, converter: be, reflect: !1, hasChanged: Re }, Kt = (e = Vt, t, i) => {
  const { kind: r, metadata: s } = i;
  let n = globalThis.litPropertyMetadata.get(s);
  if (n === void 0 && globalThis.litPropertyMetadata.set(s, n = /* @__PURE__ */ new Map()), r === "setter" && ((e = Object.create(e)).wrapped = !0), n.set(i.name, e), r === "accessor") {
    const { name: o } = i;
    return { set(l) {
      const h = t.get.call(this);
      t.set.call(this, l), this.requestUpdate(o, h, e, !0, l);
    }, init(l) {
      return l !== void 0 && this.C(o, void 0, e, l), l;
    } };
  }
  if (r === "setter") {
    const { name: o } = i;
    return function(l) {
      const h = this[o];
      t.call(this, l), this.requestUpdate(o, h, e, !0, l);
    };
  }
  throw Error("Unsupported decorator location: " + r);
};
function _(e) {
  return (t, i) => typeof i == "object" ? Kt(e, t, i) : ((r, s, n) => {
    const o = s.hasOwnProperty(n);
    return s.constructor.createProperty(n, r), o ? Object.getOwnPropertyDescriptor(s, n) : void 0;
  })(e, t, i);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function c(e) {
  return _({ ...e, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const qt = (e, t, i) => (i.configurable = !0, i.enumerable = !0, Reflect.decorate && typeof t != "object" && Object.defineProperty(e, t, i), i);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Q(e, t) {
  return (i, r, s) => {
    const n = (o) => o.renderRoot?.querySelector(e) ?? null;
    return qt(i, r, { get() {
      return n(this);
    } });
  };
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Wt = { CHILD: 2 }, Gt = (e) => (...t) => ({ _$litDirective$: e, values: t });
let Yt = class {
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, i, r) {
    this._$Ct = t, this._$AM = i, this._$Ci = r;
  }
  _$AS(t, i) {
    return this.update(t, i);
  }
  update(t, i) {
    return this.render(...i);
  }
};
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { I: Jt } = Ft, Ze = (e) => e, Xe = () => document.createComment(""), de = (e, t, i) => {
  const r = e._$AA.parentNode, s = t === void 0 ? e._$AB : t._$AA;
  if (i === void 0) {
    const n = r.insertBefore(Xe(), s), o = r.insertBefore(Xe(), s);
    i = new Jt(n, o, e, e.options);
  } else {
    const n = i._$AB.nextSibling, o = i._$AM, l = o !== e;
    if (l) {
      let h;
      i._$AQ?.(e), i._$AM = e, i._$AP !== void 0 && (h = e._$AU) !== o._$AU && i._$AP(h);
    }
    if (n !== s || l) {
      let h = i._$AA;
      for (; h !== n; ) {
        const p = Ze(h).nextSibling;
        Ze(r).insertBefore(h, s), h = p;
      }
    }
  }
  return i;
}, Y = (e, t, i = e) => (e._$AI(t, i), e), Zt = {}, Xt = (e, t = Zt) => e._$AH = t, Qt = (e) => e._$AH, Se = (e) => {
  e._$AR(), e._$AA.remove();
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Qe = (e, t, i) => {
  const r = /* @__PURE__ */ new Map();
  for (let s = t; s <= i; s++) r.set(e[s], s);
  return r;
}, oe = Gt(class extends Yt {
  constructor(e) {
    if (super(e), e.type !== Wt.CHILD) throw Error("repeat() can only be used in text expressions");
  }
  dt(e, t, i) {
    let r;
    i === void 0 ? i = t : t !== void 0 && (r = t);
    const s = [], n = [];
    let o = 0;
    for (const l of e) s[o] = r ? r(l, o) : o, n[o] = i(l, o), o++;
    return { values: n, keys: s };
  }
  render(e, t, i) {
    return this.dt(e, t, i).values;
  }
  update(e, [t, i, r]) {
    const s = Qt(e), { values: n, keys: o } = this.dt(t, i, r);
    if (!Array.isArray(s)) return this.ut = o, n;
    const l = this.ut ??= [], h = [];
    let p, y, u = 0, m = s.length - 1, g = 0, $ = n.length - 1;
    for (; u <= m && g <= $; ) if (s[u] === null) u++;
    else if (s[m] === null) m--;
    else if (l[u] === o[g]) h[g] = Y(s[u], n[g]), u++, g++;
    else if (l[m] === o[$]) h[$] = Y(s[m], n[$]), m--, $--;
    else if (l[u] === o[$]) h[$] = Y(s[u], n[$]), de(e, h[$ + 1], s[u]), u++, $--;
    else if (l[m] === o[g]) h[g] = Y(s[m], n[g]), de(e, s[u], s[m]), m--, g++;
    else if (p === void 0 && (p = Qe(o, g, $), y = Qe(l, u, m)), p.has(l[u])) if (p.has(l[m])) {
      const T = y.get(o[g]), S = T !== void 0 ? s[T] : null;
      if (S === null) {
        const fe = de(e, s[u]);
        Y(fe, n[g]), h[g] = fe;
      } else h[g] = Y(S, n[g]), de(e, s[u], S), s[T] = null;
      g++;
    } else Se(s[m]), m--;
    else Se(s[u]), u++;
    for (; g <= $; ) {
      const T = de(e, h[$ + 1]);
      Y(T, n[g]), h[g++] = T;
    }
    for (; u <= m; ) {
      const T = s[u++];
      T !== null && Se(T);
    }
    return this.ut = o, Xt(e, h), X;
  }
}), ei = [
  "entry_required",
  "entry_not_found",
  "emby_unreachable",
  "emby_auth_failed",
  "not_found",
  "session_not_found",
  "not_controllable",
  "unsupported_command"
];
class et extends Error {
  constructor(t, i) {
    super(i), this.name = "EmbyApiError", this.code = t;
  }
}
function A(e) {
  if (e instanceof et) return e;
  const t = e ?? {}, i = ei.find((r) => r === t.code) ?? "unknown";
  return new et(i, typeof t.message == "string" ? t.message : String(e));
}
class we {
  constructor(t, i) {
    this.hass = t, this.entryId = i;
  }
  async send(t, i = {}) {
    const r = { type: `emby_library/${t}` };
    this.entryId !== void 0 && t !== "entries" && (r.entry_id = this.entryId);
    for (const [s, n] of Object.entries(i))
      n != null && (r[s] = n);
    try {
      return await this.hass.connection.sendMessagePromise(r);
    } catch (s) {
      throw A(s);
    }
  }
  async entries() {
    return (await this.send("entries")).entries;
  }
  async views() {
    return (await this.send("views")).views;
  }
  async shelf(t, i) {
    return (await this.send("shelf", { shelf: t, limit: i })).items;
  }
  async items(t) {
    return this.send("items", t);
  }
  async item(t) {
    return (await this.send("item", { item_id: t })).item;
  }
  async random(t) {
    const { parent_id: i, filter: r, genre: s, year: n, max_runtime_minutes: o, max_official_rating: l } = t;
    return (await this.send("random", {
      parent_id: i,
      filter: r,
      genre: s,
      year: n,
      max_runtime_minutes: o,
      max_official_rating: l
    })).item;
  }
  async statistics() {
    return this.send("statistics");
  }
  async setPlayed(t, i) {
    await this.send("set_played", { item_id: t, played: i });
  }
  async seasons(t) {
    return (await this.send("seasons", { series_id: t })).items;
  }
  async episodes(t, i) {
    return (await this.send("episodes", { series_id: t, season_id: i })).items;
  }
  async search(t, i) {
    return (await this.send("search", { term: t, limit: i })).items;
  }
  async play(t, i, r) {
    return (await this.send("play", {
      session_id: t,
      item_id: i,
      mode: r
    })).played_item_id;
  }
  async control(t, i, r) {
    await this.send("control", { session_id: t, command: i, value: r });
  }
  async subscribeSessions(t) {
    const i = { type: "emby_library/sessions/subscribe" };
    this.entryId !== void 0 && (i.entry_id = this.entryId);
    try {
      const r = await this.hass.connection.subscribeMessage(
        t,
        i
      );
      return () => {
        Promise.resolve(r()).catch(() => {
        });
      };
    } catch (r) {
      throw A(r);
    }
  }
}
function P(e, t, i) {
  e.dispatchEvent(new CustomEvent(t, { detail: i, bubbles: !0, composed: !0 }));
}
const Me = {
  "filter.status": "Watched status",
  "filter.all": "All",
  "filter.favorites": "Favorites",
  "filter.genre": "Genre",
  "filter.year": "Year",
  "filter.runtime": "Maximum runtime (minutes)",
  "filter.rating": "Maximum age rating",
  "random.choose": "Choose a movie for me",
  "random.loading": "Choosing…",
  "random.empty": "No movies match these filters.",
  "stats.title": "Library statistics",
  "stats.movies": "Movies",
  "stats.series": "Series",
  "stats.episodes": "Episodes",
  "stats.unplayed_episodes": "Unwatched episodes",
  "stats.runtime": "Total runtime",
  "stats.loading": "Loading library statistics…",
  "detail.mark_played": "Mark watched",
  "detail.mark_unplayed": "Mark unwatched",
  "detail.mark_all_played": "Mark all episodes watched",
  "detail.mark_all_unplayed": "Mark all episodes unwatched",
  "detail.saving": "Saving…",
  "detail.trailer": "Trailer",
  "detail.quality": "Media quality",
  "nav.home": "Home",
  "nav.library": "Library",
  "nav.search": "Search",
  "nav.back": "Back",
  "nav.breadcrumb": "Breadcrumb",
  "nav.views": "Views",
  "shelf.resume": "Continue watching",
  "shelf.next_up": "Next up",
  "shelf.latest": "Recently added",
  "shelf.suggestions": "Recommended",
  "home.empty": "Nothing to show yet.",
  "library.empty": "This library is empty.",
  "library.empty_unplayed": "Nothing unwatched here.",
  "library.no_views": "No libraries found.",
  "library.sort": "Sort by",
  "library.order_asc": "Ascending order. Switch to descending",
  "library.order_desc": "Descending order. Switch to ascending",
  "library.unplayed": "Unwatched",
  "library.count": "{count} items",
  "library.loading_more": "Loading more",
  "sort.SortName": "Name",
  "sort.DateCreated": "Date added",
  "sort.PremiereDate": "Release date",
  "sort.CommunityRating": "Rating",
  "sort.DatePlayed": "Date played",
  "search.placeholder": "Search movies, series and episodes",
  "search.hint": "Type at least 2 characters.",
  "search.empty": "No results for “{term}”.",
  "search.movies": "Movies",
  "search.series": "Series",
  "search.episodes": "Episodes",
  "search.clear": "Clear search",
  "detail.play": "Play",
  "detail.resume": "Resume",
  "detail.play_from_start": "Play from start",
  "detail.show_more": "Show more",
  "detail.show_less": "Show less",
  "detail.seasons": "Seasons",
  "detail.episodes": "Episodes",
  "detail.no_episodes": "No episodes.",
  "detail.played": "Watched",
  "detail.unplayed_count": "{count} unwatched",
  "detail.season_count": "{count} seasons",
  "detail.season_count_one": "1 season",
  "detail.rating": "Rating {rating}",
  "detail.open_series": "Open {name}",
  "time.h": "h",
  "time.min": "min",
  "error.unreachable": "Cannot reach Emby",
  "error.retry": "Try again",
  "error.auth": "Emby rejected the API key. Enter a new one under Settings → Devices & services.",
  "error.no_entry": "Set up Emby Library under Settings → Devices & services",
  "error.entry_required": "Several Emby users are set up. Choose one in the card configuration.",
  "error.entry_not_found": "The selected Emby user was not found or is not loaded. Check the card configuration.",
  "error.edit_dashboard": "Edit dashboard",
  "error.open_integrations": "Open Devices & services",
  "error.not_found": "The item no longer exists.",
  "error.unsupported": "The client or the item does not support this.",
  "error.generic": "Something went wrong.",
  "target.title": "Play on",
  "target.choose": "Choose client",
  "target.current": "Plays on {name}. Change client",
  "target.none": "Open Emby on the device you want to play on",
  "target.offline": "Off. Will be woken first",
  "target.offline_no_wake": "Offline. Open Emby on this device",
  "target.waking": "Waking {name}…",
  "target.starting": "Starting on {name}…",
  "target.no_response": "The client did not respond",
  "target.not_started": "The client did not start playback",
  "target.lost": "The client is no longer available. Choose another.",
  "target.playing": "Playing: {title}",
  "target.selected": "Selected",
  "target.close": "Close",
  "np.title": "Now playing",
  "np.play": "Play",
  "np.pause": "Pause",
  "np.stop": "Stop",
  "np.next": "Next",
  "np.previous": "Previous",
  "np.seek": "Seek",
  "np.volume": "Volume",
  "np.mute": "Mute",
  "np.unmute": "Unmute",
  "np.expand": "Show controls for {device}",
  "np.collapse": "Hide controls for {device}",
  "editor.entry": "Emby user",
  "editor.start_view": "Start view",
  "editor.shelves": "Home rows",
  "editor.shelf_limit": "Items per row",
  "editor.show_now_playing": "Show Now playing",
  "editor.show_search": "Show search",
  "editor.poster_size": "Size",
  "editor.size.small": "Small",
  "editor.size.medium": "Medium",
  "editor.size.large": "Large",
  "editor.height": "Height in pixels (0 = automatic)",
  "editor.default_target": "Default player",
  "editor.targets_hint": "Select the clients you want to use in this card. Only selected clients are shown. You can change their names and optionally configure volume and playback controls below.",
  "editor.clients": "Clients",
  "editor.targets": "Client settings",
  "editor.new_target": "New client",
  "editor.add_target": "Add client",
  "editor.remove_target": "Remove client",
  "editor.target_error": "Changes have not been saved. Choose a player and enter a name for each player you add.",
  "editor.target.name": "Name",
  "editor.target.device_id": "Emby client (device ID)",
  "editor.target.volume_entity": "Media player for volume",
  "editor.target.control_entity": "Media player for playback control"
}, tt = {
  "filter.status": "Settstatus",
  "filter.all": "Alle",
  "filter.favorites": "Favoritter",
  "filter.genre": "Sjanger",
  "filter.year": "Årstall",
  "filter.runtime": "Maks spilletid (minutter)",
  "filter.rating": "Maks aldersgrense",
  "random.choose": "Velg en film for meg",
  "random.loading": "Velger…",
  "random.empty": "Ingen filmer passer disse filtrene.",
  "stats.title": "Bibliotekstatistikk",
  "stats.movies": "Filmer",
  "stats.series": "Serier",
  "stats.episodes": "Episoder",
  "stats.unplayed_episodes": "Usette episoder",
  "stats.runtime": "Samlet spilletid",
  "stats.loading": "Henter bibliotekstatistikk…",
  "detail.mark_played": "Marker som sett",
  "detail.mark_unplayed": "Marker som usett",
  "detail.mark_all_played": "Marker alle episoder som sett",
  "detail.mark_all_unplayed": "Marker alle episoder som usett",
  "detail.saving": "Lagrer…",
  "detail.trailer": "Trailer",
  "detail.quality": "Mediekvalitet",
  "nav.home": "Hjem",
  "nav.library": "Bibliotek",
  "nav.search": "Søk",
  "nav.back": "Tilbake",
  "nav.breadcrumb": "Brødsmulesti",
  "nav.views": "Visninger",
  "shelf.resume": "Fortsett å se",
  "shelf.next_up": "Neste episoder",
  "shelf.latest": "Nylig lagt til",
  "shelf.suggestions": "Anbefalt",
  "home.empty": "Ingenting å vise ennå.",
  "library.empty": "Dette biblioteket er tomt.",
  "library.empty_unplayed": "Ingenting usett her.",
  "library.no_views": "Fant ingen bibliotek.",
  "library.sort": "Sorter etter",
  "library.order_asc": "Stigende rekkefølge. Bytt til synkende",
  "library.order_desc": "Synkende rekkefølge. Bytt til stigende",
  "library.unplayed": "Usett",
  "library.count": "{count} elementer",
  "library.loading_more": "Laster flere",
  "sort.SortName": "Navn",
  "sort.DateCreated": "Lagt til",
  "sort.PremiereDate": "Utgivelsesdato",
  "sort.CommunityRating": "Vurdering",
  "sort.DatePlayed": "Sist spilt",
  "search.placeholder": "Søk i filmer, serier og episoder",
  "search.hint": "Skriv minst 2 tegn.",
  "search.empty": "Ingen treff på «{term}».",
  "search.movies": "Filmer",
  "search.series": "Serier",
  "search.episodes": "Episoder",
  "search.clear": "Tøm søk",
  "detail.play": "Spill",
  "detail.resume": "Fortsett",
  "detail.play_from_start": "Spill fra start",
  "detail.show_more": "Vis mer",
  "detail.show_less": "Vis mindre",
  "detail.seasons": "Sesonger",
  "detail.episodes": "Episoder",
  "detail.no_episodes": "Ingen episoder.",
  "detail.played": "Sett",
  "detail.unplayed_count": "{count} usett",
  "detail.season_count": "{count} sesonger",
  "detail.season_count_one": "1 sesong",
  "detail.rating": "Vurdering {rating}",
  "detail.open_series": "Åpne {name}",
  "time.h": "t",
  "time.min": "min",
  "error.unreachable": "Får ikke kontakt med Emby",
  "error.retry": "Prøv igjen",
  "error.auth": "Emby avviste API-nøkkelen. Oppgi en ny under Innstillinger → Enheter og tjenester.",
  "error.no_entry": "Sett opp Emby Library under Innstillinger → Enheter og tjenester",
  "error.entry_required": "Flere Emby-brukere er satt opp. Velg én i kortets konfigurasjon.",
  "error.entry_not_found": "Den valgte Emby-brukeren ble ikke funnet eller er ikke lastet. Sjekk kortets konfigurasjon.",
  "error.edit_dashboard": "Rediger dashbordet",
  "error.open_integrations": "Åpne Enheter og tjenester",
  "error.not_found": "Elementet finnes ikke lenger.",
  "error.unsupported": "Klienten eller elementet støtter ikke dette.",
  "error.generic": "Noe gikk galt.",
  "target.title": "Spill på",
  "target.choose": "Velg klient",
  "target.current": "Spiller på {name}. Bytt klient",
  "target.none": "Åpne Emby på enheten du vil spille på",
  "target.offline": "Av. Vekkes først",
  "target.offline_no_wake": "Frakoblet. Åpne Emby på denne enheten",
  "target.waking": "Vekker {name} …",
  "target.starting": "Starter på {name} …",
  "target.no_response": "Klienten svarte ikke",
  "target.not_started": "Klienten startet ikke avspillingen",
  "target.lost": "Klienten er ikke lenger tilgjengelig. Velg en annen.",
  "target.playing": "Spiller: {title}",
  "target.selected": "Valgt",
  "target.close": "Lukk",
  "np.title": "Spilles nå",
  "np.play": "Spill",
  "np.pause": "Pause",
  "np.stop": "Stopp",
  "np.next": "Neste",
  "np.previous": "Forrige",
  "np.seek": "Spol",
  "np.volume": "Volum",
  "np.mute": "Demp",
  "np.unmute": "Slå på lyd",
  "np.expand": "Vis kontroller for {device}",
  "np.collapse": "Skjul kontroller for {device}",
  "editor.entry": "Emby-bruker",
  "editor.start_view": "Startvisning",
  "editor.shelves": "Rader på Hjem",
  "editor.shelf_limit": "Elementer per rad",
  "editor.show_now_playing": "Vis Spilles nå",
  "editor.show_search": "Vis søk",
  "editor.poster_size": "Størrelse",
  "editor.size.small": "Liten",
  "editor.size.medium": "Middels",
  "editor.size.large": "Stor",
  "editor.height": "Høyde i piksler (0 = automatisk)",
  "editor.default_target": "Standardspiller",
  "editor.targets_hint": "Velg klientene du vil bruke i kortet. Bare valgte klienter vises. Du kan endre navn og eventuelt velge volum og avspillingskontroll under.",
  "editor.clients": "Klienter",
  "editor.targets": "Klientinnstillinger",
  "editor.new_target": "Ny klient",
  "editor.add_target": "Legg til klient",
  "editor.remove_target": "Fjern klient",
  "editor.target_error": "Endringene er ikke lagret. Velg en spiller og oppgi et navn for hver spiller du legger til.",
  "editor.target.name": "Navn",
  "editor.target.device_id": "Emby-klient (enhets-ID)",
  "editor.target.volume_entity": "Mediespiller for volum",
  "editor.target.control_entity": "Mediespiller for avspillingskontroll"
}, it = { en: Me, nb: tt, no: tt };
function mt(e) {
  return e?.locale?.language ?? e?.language ?? "en";
}
function b(e, t, i = {}) {
  const r = e.toLowerCase();
  let n = (it[r] ?? it[r.split("-")[0] ?? ""] ?? Me)[t] ?? Me[t] ?? t;
  for (const [o, l] of Object.entries(i))
    n = n.replaceAll(`{${o}}`, String(l));
  return n;
}
const F = D`
  :host {
    --el-gap: 12px;
    --el-radius: var(--ha-card-border-radius, 12px);
    --el-tile-radius: 8px;
    --el-surface: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
    --el-muted: var(--secondary-text-color);
    --el-accent: var(--primary-color);
    --el-on-accent: var(--text-primary-color, #fff);
    box-sizing: border-box;
    color: var(--primary-text-color);
    font-family: var(--ha-font-family-body, var(--paper-font-body1_-_font-family, inherit));
  }
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  [hidden] {
    display: none !important;
  }
  button {
    font: inherit;
    color: inherit;
    background: none;
    border: 0;
    margin: 0;
    padding: 0;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  button:disabled {
    cursor: default;
    opacity: 0.5;
  }
  :focus {
    outline: none;
  }
  :focus-visible {
    outline: 2px solid var(--el-accent);
    outline-offset: 2px;
  }
  .icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    min-height: 44px;
    border-radius: 50%;
    color: var(--primary-text-color);
  }
  .icon-button:hover:not(:disabled) {
    background: var(--el-surface);
  }
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 44px;
    padding: 0 18px;
    border-radius: 22px;
    background: var(--el-surface);
    font-weight: 500;
    white-space: nowrap;
  }
  .button.primary {
    background: var(--el-accent);
    color: var(--el-on-accent);
  }
  .button:hover:not(:disabled) {
    filter: brightness(1.1);
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 44px;
    padding: 0 14px;
    border-radius: 22px;
    background: var(--el-surface);
    white-space: nowrap;
  }
  .chip[aria-pressed="true"],
  .chip[aria-selected="true"] {
    background: var(--el-accent);
    color: var(--el-on-accent);
  }
  .state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 32px 16px;
    text-align: center;
    color: var(--el-muted);
  }
  .state ha-icon {
    --mdc-icon-size: 40px;
  }
  .state.error > ha-icon {
    color: var(--error-color);
  }
  .muted {
    color: var(--el-muted);
  }
  .skeleton {
    position: relative;
    overflow: hidden;
    background: var(--el-surface);
    border-radius: var(--el-tile-radius);
  }
  .skeleton::after {
    content: "";
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    background: linear-gradient(90deg, transparent, rgba(127, 127, 127, 0.18), transparent);
    animation: el-shimmer 1.4s infinite;
  }
  @keyframes el-shimmer {
    100% {
      transform: translateX(100%);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .skeleton::after {
      animation: none;
    }
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
`;
function ti(e, t) {
  const { poster: i, still: r, backdrop: s } = e.images;
  return t === "poster" ? i ?? null : r ?? s ?? null;
}
function Te(e, t = "h", i = "min") {
  if (e == null || !Number.isFinite(e) || e <= 0)
    return "";
  const r = Math.max(1, Math.round(e / 60)), s = Math.floor(r / 60), n = r % 60;
  return s === 0 ? `${n} ${i}` : n === 0 ? `${s} ${t}` : `${s} ${t} ${n} ${i}`;
}
function Ae(e) {
  if (e == null || !Number.isFinite(e) || e < 0)
    return "0:00";
  const t = Math.floor(e), i = Math.floor(t / 3600), r = Math.floor(t % 3600 / 60), s = t % 60, n = String(s).padStart(2, "0");
  return i > 0 ? `${i}:${String(r).padStart(2, "0")}:${n}` : `${r}:${n}`;
}
function gt(e) {
  return e.season_number === null || e.episode_number === null ? "" : `S${e.season_number}E${e.episode_number}`;
}
function Ie(e) {
  const t = gt(e);
  return t ? `${t} · ${e.name}` : e.name;
}
function ii(e) {
  return e.type === "Episode" ? e.series_name ? { title: e.series_name, subtitle: Ie(e) } : { title: Ie(e), subtitle: "" } : { title: e.name, subtitle: e.year !== null ? String(e.year) : "" };
}
function si(e, t) {
  const i = e.position_s ?? 0;
  if (e.state !== "playing") return i;
  const r = i + Math.max(0, t) / 1e3;
  return e.duration_s !== null ? Math.min(r, e.duration_s) : r;
}
function ri(e, t) {
  return e === null || t === null || t <= 0 ? 0 : Math.min(1, Math.max(0, e / t));
}
const st = (e) => `emby-library-card:target:${e}`;
function ni(e, t) {
  const i = new Map(e.map((r) => [r.device_id, {
    name: r.name,
    device_id: r.device_id
  }]));
  for (const r of t) i.set(r.device_id, r);
  return [...i.values()];
}
function rt(e, t) {
  return e.filter((i) => t === null || t.includes(i.device_id));
}
function oi(e, t, i, r) {
  const s = i.filter((l) => l.controllable), n = (l) => l !== null && (s.some((h) => h.device_id === l) || r.some((h) => h.device_id === l));
  return n(e) ? e : n(t) ? t : new Set(s.map((l) => l.device_id)).size === 1 && s.length === 1 ? s[0].device_id : null;
}
function nt(e, t) {
  return e === null ? null : t.find((i) => i.controllable && i.device_id === e) ?? null;
}
function ai(e) {
  return {
    movies: e.filter((t) => t.type === "Movie" || t.type === "Video"),
    series: e.filter((t) => t.type === "Series"),
    episodes: e.filter((t) => t.type === "Episode")
  };
}
function li(e, t, i, r) {
  const s = Math.max(1, r);
  if (t - e <= i) return e;
  const n = t - e - i;
  return e + Math.ceil(n / s) * s;
}
const hi = 4, di = 8;
function ci(e, t) {
  const i = {};
  for (const r of e) {
    const s = r.volume_entity, n = s ? t?.[s] : void 0;
    if (!s || !n || n.state === "unavailable" || n.state === "unknown")
      continue;
    const o = Number(n.attributes.supported_features) || 0, l = n.attributes.volume_level, h = (o & hi) !== 0, p = (o & di) !== 0;
    !h && !p || (i[r.device_id] = {
      entityId: s,
      level: typeof l == "number" && Number.isFinite(l) ? Math.round(Math.min(1, Math.max(0, l)) * 100) : null,
      muted: n.attributes.is_volume_muted === !0,
      canSet: h,
      canMute: p
    });
  }
  return i;
}
const pi = [
  ["pause", 1],
  ["previous", 16],
  ["next", 32],
  ["stop", 4096],
  ["play", 16384]
];
function ui(e) {
  const t = [e.attributes.app_id, e.attributes.app_name].filter(
    (i) => typeof i == "string" && i !== ""
  );
  return t.length === 0 || t.some((i) => /emby/i.test(i));
}
function _i(e, t) {
  const i = {};
  for (const r of e) {
    const s = r.control_entity, n = s ? t?.[s] : void 0;
    if (!s || !n || n.state === "unavailable" || n.state === "unknown")
      continue;
    const o = Number(n.attributes.supported_features) || 0, l = pi.filter(([, h]) => (o & h) !== 0).map(
      ([h]) => h
    );
    l.length !== 0 && (i[r.device_id] = { entityId: s, commands: ui(n) ? l : [] });
  }
  return i;
}
var mi = Object.defineProperty, gi = Object.getOwnPropertyDescriptor, U = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? gi(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (r ? o(t, i, s) : o(s)) || s);
  return r && s && mi(t, i, s), s;
};
let I = class extends C {
  constructor() {
    super(...arguments), this.language = "en", this.sessions = [], this.volumes = {}, this.controls = {}, this.receivedAt = 0, this._now = Date.now(), this._expanded = null, this._dragging = null;
  }
  _t(e, t) {
    return b(this.language, e, t);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._stopTicker();
  }
  willUpdate(e) {
    (e.has("sessions") || e.has("receivedAt")) && (this._now = Date.now(), this.sessions.some((t) => t.state === "playing") ? this._ticker ??= setInterval(() => this._now = Date.now(), 1e3) : this._stopTicker());
  }
  _stopTicker() {
    clearInterval(this._ticker), this._ticker = void 0;
  }
  _send(e, t, i) {
    P(this, "emby-control", { sessionId: e.session_id, command: t, value: i });
  }
  _toggle(e) {
    this._expanded = this._expanded === e.session_id ? null : e.session_id;
  }
  render() {
    const e = this.sessions.filter(
      (t) => t.state !== "idle" && t.now_playing !== null
    );
    return e.length === 0 ? d : a`
      <section aria-label=${this._t("np.title")}>
        ${oe(
      e,
      (t) => t.session_id,
      (t) => this._renderSession(t)
    )}
      </section>
    `;
  }
  _renderSession(e) {
    const t = e.now_playing, i = this.controls[e.device_id], r = (m) => (i ? i.commands : e.supported_commands).includes(m), s = (m) => {
      i ? P(this, "emby-media", { entityId: i.entityId, command: m }) : this._send(e, m);
    }, n = this._expanded === e.session_id, o = si(e, this._now - this.receivedAt), l = t.images.still ?? t.images.poster, h = t.type === "Episode" && t.series_name ? t.series_name : t.name, p = t.type === "Episode" ? Ie(t) : "", y = e.state === "playing", u = y ? r("pause") ? "pause" : r("play_pause") ? "play_pause" : null : r("play") ? "play" : r("play_pause") ? "play_pause" : null;
    return a`
      <div class="session">
        <div class="strip">
          <button
            class="summary"
            aria-expanded=${n ? "true" : "false"}
            aria-label=${this._t(n ? "np.collapse" : "np.expand", {
      device: e.device_name
    })}
            @click=${() => this._toggle(e)}
          >
            <span class="thumb">
              ${l ? a`<img
                    src=${l}
                    alt=${t.name}
                    decoding="async"
                    @error=${(m) => m.target.remove()}
                  />` : a`<ha-icon icon="mdi:play-box-outline"></ha-icon>`}
            </span>
            <span class="text">
              <span class="title">${h}</span>
              <span class="muted small">
                ${p ? a`${p} · ` : d}${e.device_name}
              </span>
            </span>
          </button>
          <div class="buttons">
            ${r("previous") ? this._button("mdi:skip-previous", "np.previous", () => s("previous")) : d}
            ${u ? this._button(
      y ? "mdi:pause" : "mdi:play",
      y ? "np.pause" : "np.play",
      () => s(u)
    ) : d}
            ${r("next") ? this._button("mdi:skip-next", "np.next", () => s("next")) : d}
            ${r("stop") ? this._button("mdi:stop", "np.stop", () => s("stop")) : d}
          </div>
        </div>
        <div class="bar" aria-hidden="true">
          <div style="width:${(ri(o, e.duration_s) * 100).toFixed(2)}%"></div>
        </div>
        ${n ? this._renderControls(e, o) : d}
      </div>
    `;
  }
  _button(e, t, i) {
    return a`<button class="icon-button" aria-label=${this._t(t)} @click=${i}>
      <ha-icon icon=${e}></ha-icon>
    </button>`;
  }
  _renderControls(e, t) {
    const i = (S) => e.supported_commands.includes(S), r = `seek:${e.session_id}`, s = `volume:${e.session_id}`, n = (S, fe) => this._dragging?.key === S ? this._dragging.value : fe, o = e.duration_s ?? 0, l = n(r, t), h = e.can_seek && i("seek") && o > 0, p = this.volumes[e.device_id], y = p ? p.muted : e.muted, u = e.muted ? i("unmute") ? "unmute" : null : i("mute") ? "mute" : null, m = p ? p.canMute : u !== null, g = p ? p.canSet : i("set_volume"), $ = p ? p.level ?? 0 : e.volume ?? 100, T = () => {
      p ? P(this, "emby-volume", { entityId: p.entityId, muted: !y }) : u && this._send(e, u);
    };
    return a`
      <div class="controls">
        <div class="line">
          <span class="time">${Ae(l)}</span>
          ${h ? a`<input
                type="range"
                min="0"
                max=${o}
                step="1"
                .value=${String(Math.floor(l))}
                aria-label=${this._t("np.seek")}
                aria-valuetext=${Ae(l)}
                @input=${(S) => this._drag(r, S)}
                @change=${(S) => this._commit(e, "seek", S)}
              />` : a`<span class="flex"></span>`}
          ${o > 0 ? a`<span class="time">${Ae(o)}</span>` : d}
        </div>
        ${g || m ? a`<div class="line">
              ${m ? this._button(
      y ? "mdi:volume-off" : "mdi:volume-high",
      y ? "np.unmute" : "np.mute",
      T
    ) : a`<ha-icon class="pad" icon="mdi:volume-high"></ha-icon>`}
              ${g ? a`<input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    .value=${String(n(s, $))}
                    aria-label=${this._t("np.volume")}
                    @input=${(S) => this._drag(s, S)}
                    @change=${(S) => p ? this._commitExternal(p, S) : this._commit(e, "set_volume", S)}
                  />` : d}
            </div>` : d}
      </div>
    `;
  }
  _commitExternal(e, t) {
    const i = Number(t.target.value);
    P(this, "emby-volume", { entityId: e.entityId, level: i }), setTimeout(() => this._dragging = null, 2500);
  }
  _drag(e, t) {
    this._dragging = { key: e, value: Number(t.target.value) };
  }
  _commit(e, t, i) {
    const r = Number(i.target.value);
    this._send(e, t, r), setTimeout(() => this._dragging = null, 2500);
  }
};
I.styles = [
  F,
  D`
      :host {
        display: block;
        container-type: inline-size;
      }
      .session {
        border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
        background: var(--card-background-color, var(--primary-background-color));
      }
      .strip {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 8px 6px 12px;
      }
      .summary {
        flex: 1;
        min-width: 0;
        min-height: 48px;
        display: flex;
        align-items: center;
        gap: 12px;
        text-align: left;
        border-radius: var(--el-tile-radius);
      }
      .thumb {
        flex: 0 0 72px;
        aspect-ratio: 16 / 9;
        overflow: hidden;
        border-radius: 6px;
        background: var(--el-surface);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--el-muted);
      }
      .thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .title,
      .small {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .title {
        font-weight: 500;
      }
      .small {
        font-size: 0.85em;
      }
      .buttons {
        display: flex;
        flex: none;
      }
      .bar {
        height: 3px;
        background: var(--el-surface);
      }
      .bar div {
        height: 100%;
        background: var(--el-accent);
        transition: width 1s linear;
      }
      @media (prefers-reduced-motion: reduce) {
        .bar div {
          transition: none;
        }
      }
      .controls {
        padding: 4px 12px 10px;
      }
      .line {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 44px;
      }
      .time {
        font-variant-numeric: tabular-nums;
        font-size: 0.85em;
        color: var(--el-muted);
        min-width: 3.2em;
        text-align: center;
      }
      .flex {
        flex: 1;
      }
      .pad {
        width: 44px;
        text-align: center;
        color: var(--el-muted);
      }
      input[type="range"] {
        flex: 1;
        min-width: 0;
        height: 44px;
        margin: 0;
        accent-color: var(--el-accent);
        background: transparent;
      }
      @container (max-width: 420px) {
        .thumb {
          display: none;
        }
      }
    `
];
U([
  _()
], I.prototype, "language", 2);
U([
  _({ attribute: !1 })
], I.prototype, "sessions", 2);
U([
  _({ attribute: !1 })
], I.prototype, "volumes", 2);
U([
  _({ attribute: !1 })
], I.prototype, "controls", 2);
U([
  _({ type: Number })
], I.prototype, "receivedAt", 2);
U([
  c()
], I.prototype, "_now", 2);
U([
  c()
], I.prototype, "_expanded", 2);
U([
  c()
], I.prototype, "_dragging", 2);
I = U([
  z("emby-library-now-playing")
], I);
var fi = Object.defineProperty, yi = Object.getOwnPropertyDescriptor, ae = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? yi(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (r ? o(t, i, s) : o(s)) || s);
  return r && s && fi(t, i, s), s;
};
let K = class extends C {
  constructor() {
    super(...arguments), this.language = "en", this.sessions = [], this.targets = [], this.selectedDeviceId = null;
  }
  _t(e, t) {
    return b(this.language, e, t);
  }
  firstUpdated() {
    const e = this._dialog;
    e && !e.open && (typeof e.showModal == "function" ? e.showModal() : e.setAttribute("open", ""));
  }
  _close() {
    P(this, "emby-close");
  }
  _onCancel(e) {
    e.preventDefault(), this._close();
  }
  _onBackdrop(e) {
    e.target === this._dialog && this._close();
  }
  _choose(e) {
    P(this, "emby-target-chosen", e);
  }
  render() {
    const e = this.sessions.filter((s) => s.controllable), t = new Set(e.map((s) => s.device_id)), i = this.targets.filter((s) => !t.has(s.device_id)), r = new Map(this.targets.map((s) => [s.device_id, s.name]));
    return a`
      <dialog
        aria-labelledby="title"
        @cancel=${this._onCancel}
        @click=${this._onBackdrop}
      >
        <div class="sheet">
          <header>
            <h2 id="title">${this._t("target.title")}</h2>
            <button class="icon-button" aria-label=${this._t("target.close")} @click=${this._close}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </header>
          ${e.length === 0 && i.length === 0 ? a`<div class="state" role="status">
                  <ha-icon icon="mdi:television-off"></ha-icon>
                  <div>${this._t("target.none")}</div>
                </div>` : a`<ul>
                  ${e.map(
      (s) => this._renderRow(
        r.get(s.device_id) ?? s.device_name,
        s.now_playing ? `${s.client} · ${this._t("target.playing", {
          title: s.now_playing.name
        })}` : s.client,
        "mdi:television",
        s.device_id === this.selectedDeviceId,
        !1,
        () => this._choose({ kind: "session", session: s })
      )
    )}
                  ${i.map(
      (s) => this._renderRow(
        s.name,
        this._t(s.wake_action ? "target.offline" : "target.offline_no_wake"),
        "mdi:power-sleep",
        s.device_id === this.selectedDeviceId,
        s.wake_action === void 0,
        () => this._choose({ kind: "target", target: s })
      )
    )}
                </ul>`}
        </div>
      </dialog>
    `;
  }
  _renderRow(e, t, i, r, s, n) {
    return a`
      <li>
        <button class="row" ?disabled=${s} aria-current=${r ? "true" : "false"} @click=${n}>
          <ha-icon icon=${i}></ha-icon>
          <span class="text">
            <span class="name">${e}</span>
            <span class="muted small">${t}</span>
          </span>
          ${r ? a`<ha-icon
                class="check"
                icon="mdi:check"
                role="img"
                aria-label=${this._t("target.selected")}
              ></ha-icon>` : d}
        </button>
      </li>
    `;
  }
};
K.styles = [
  F,
  D`
      dialog {
        width: min(420px, calc(100vw - 32px));
        max-height: min(560px, calc(100vh - 32px));
        padding: 0;
        border: 0;
        border-radius: var(--el-radius);
        background: var(--card-background-color, var(--primary-background-color));
        color: var(--primary-text-color);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      }
      dialog::backdrop {
        background: rgba(0, 0, 0, 0.5);
      }
      .sheet {
        display: flex;
        flex-direction: column;
        max-height: inherit;
      }
      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 8px 8px 20px;
      }
      h2 {
        margin: 0;
        font-size: 1.15em;
        font-weight: 500;
      }
      ul {
        list-style: none;
        margin: 0;
        padding: 0 8px 12px;
        overflow-y: auto;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 14px;
        width: 100%;
        min-height: 56px;
        padding: 8px 12px;
        border-radius: var(--el-tile-radius);
        text-align: left;
      }
      .row:hover:not(:disabled),
      .row[aria-current="true"] {
        background: var(--el-surface);
      }
      .text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .name,
      .small {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .small {
        font-size: 0.85em;
      }
      .check {
        color: var(--el-accent);
      }
    `
];
ae([
  _()
], K.prototype, "language", 2);
ae([
  _({ attribute: !1 })
], K.prototype, "sessions", 2);
ae([
  _({ attribute: !1 })
], K.prototype, "targets", 2);
ae([
  _({ attribute: !1 })
], K.prototype, "selectedDeviceId", 2);
ae([
  Q("dialog")
], K.prototype, "_dialog", 2);
K = ae([
  z("emby-library-target-picker")
], K);
const te = ["resume", "next_up", "latest", "suggestions"], ft = ["home", "library", "search"], yt = ["small", "medium", "large"], ot = { small: 110, medium: 150, large: 190 }, ie = {
  start_view: "home",
  shelves: [...te],
  shelf_limit: 20,
  show_now_playing: !0,
  show_search: !0,
  poster_size: "medium",
  height: "auto",
  default_target: null,
  allowed_targets: [],
  targets: []
}, vi = ["type", "view_layout", "layout_options", "grid_options", "visibility"], bi = [...vi, "entry", ...Object.keys(ie)], pe = (e) => typeof e == "object" && e !== null && !Array.isArray(e);
function Ce(e, t, i) {
  if (typeof t != "string" || !i.includes(t))
    throw new Error(`"${e}" must be one of: ${i.join(", ")}`);
  return t;
}
function at(e, t) {
  if (typeof t != "boolean") throw new Error(`"${e}" must be true or false`);
  return t;
}
function $i(e, t) {
  if (!pe(t)) throw new Error(`"${e}" must be an action`);
  const i = t.action ?? t.service;
  if (typeof i != "string" || !/^[a-z0-9_]+\.[a-z0-9_]+$/.test(i))
    throw new Error(`"${e}.action" must be an action such as script.turn_on`);
  const r = { action: i };
  if (t.target !== void 0) {
    if (!pe(t.target)) throw new Error(`"${e}.target" must be a mapping`);
    r.target = t.target;
  }
  if (t.data !== void 0) {
    if (!pe(t.data)) throw new Error(`"${e}.data" must be a mapping`);
    r.data = t.data;
  }
  return r;
}
function vt(e) {
  if (!Array.isArray(e)) throw new Error('"targets" must be a list');
  return e.map((t, i) => {
    const r = `targets[${i}]`;
    if (!pe(t)) throw new Error(`"${r}" must be a mapping`);
    for (const n of Object.keys(t))
      if (!["name", "device_id", "wake_action", "volume_entity", "control_entity"].includes(n))
        throw new Error(`Unknown field "${r}.${n}"`);
    if (typeof t.name != "string" || !t.name)
      throw new Error(`"${r}.name" is required`);
    if (typeof t.device_id != "string" || !t.device_id)
      throw new Error(`"${r}.device_id" is required`);
    const s = { name: t.name, device_id: t.device_id };
    t.wake_action !== void 0 && (s.wake_action = $i(`${r}.wake_action`, t.wake_action));
    for (const n of ["volume_entity", "control_entity"]) {
      const o = t[n];
      if (o != null) {
        if (typeof o != "string" || !/^media_player\.[a-z0-9_]+$/.test(o))
          throw new Error(`"${r}.${n}" must be a media_player entity`);
        s[n] = o;
      }
    }
    return s;
  });
}
function re(e) {
  if (!pe(e)) throw new Error("Invalid configuration");
  for (const i of Object.keys(e))
    if (!bi.includes(i)) throw new Error(`Unknown field "${i}"`);
  const t = {
    type: typeof e.type == "string" ? e.type : "custom:emby-library-card",
    ...ie,
    shelves: [...ie.shelves],
    targets: []
  };
  if (e.entry !== void 0 && e.entry !== null && e.entry !== "") {
    if (typeof e.entry != "string") throw new Error('"entry" must be a config entry ID');
    t.entry = e.entry;
  }
  if (e.start_view !== void 0 && (t.start_view = Ce("start_view", e.start_view, ft)), e.shelves !== void 0) {
    if (!Array.isArray(e.shelves)) throw new Error('"shelves" must be a list');
    const i = e.shelves.map((r) => Ce("shelves", r, te));
    if (new Set(i).size !== i.length)
      throw new Error('"shelves" cannot contain the same row twice');
    t.shelves = i;
  }
  if (e.shelf_limit !== void 0) {
    const i = e.shelf_limit;
    if (typeof i != "number" || !Number.isInteger(i) || i < 1 || i > 50)
      throw new Error('"shelf_limit" must be a whole number from 1 to 50');
    t.shelf_limit = i;
  }
  if (e.show_now_playing !== void 0 && (t.show_now_playing = at("show_now_playing", e.show_now_playing)), e.show_search !== void 0 && (t.show_search = at("show_search", e.show_search)), e.poster_size !== void 0 && (t.poster_size = Ce("poster_size", e.poster_size, yt)), e.height !== void 0 && e.height !== "auto") {
    const i = e.height;
    if (typeof i != "number" || !Number.isFinite(i) || i < 200)
      throw new Error('"height" must be "auto" or a number of pixels (at least 200)');
    t.height = Math.round(i);
  }
  if (e.default_target !== void 0 && e.default_target !== null) {
    if (typeof e.default_target != "string" || !e.default_target)
      throw new Error('"default_target" must be a device_id');
    t.default_target = e.default_target;
  }
  if (e.targets !== void 0 && e.targets !== null && (t.targets = vt(e.targets)), e.allowed_targets !== void 0 && e.allowed_targets !== null) {
    if (!Array.isArray(e.allowed_targets) || e.allowed_targets.some(
      (i) => typeof i != "string" || !i.trim()
    ))
      throw new Error('"allowed_targets" must be a list of Emby device IDs');
    e.targets === void 0 && (t.targets = [...new Set(e.allowed_targets)].map((i) => ({
      name: i,
      device_id: i
    })));
  }
  if (t.allowed_targets = [...new Set(t.targets.map((i) => i.device_id))], t.default_target !== null && !t.allowed_targets.includes(t.default_target) && (t.default_target = null), t.start_view === "search" && !t.show_search)
    throw new Error('"start_view: search" requires "show_search: true"');
  return t;
}
function wi(e) {
  return {
    name: e.name,
    device_id: e.device_id,
    volume_entity: e.volume_entity,
    control_entity: e.control_entity,
    wake_action: e.wake_action?.action,
    wake_target: e.wake_action?.target,
    wake_data: e.wake_action?.data
  };
}
function xi(e) {
  return vt(e.map((t) => ({
    name: t.name?.trim(),
    device_id: t.device_id?.trim(),
    ...t.volume_entity ? { volume_entity: t.volume_entity } : {},
    ...t.control_entity ? { control_entity: t.control_entity } : {},
    ...t.wake_action?.trim() ? {
      wake_action: {
        action: t.wake_action.trim(),
        ...t.wake_target ? { target: t.wake_target } : {},
        ...t.wake_data ? { data: t.wake_data } : {}
      }
    } : {}
  })));
}
function ki(e, t) {
  const i = xi(t), r = { ...e };
  return i.length ? r.targets = i : delete r.targets, delete r.allowed_targets, re(r).default_target === null && delete r.default_target, r;
}
const Ei = 200;
function Si(e, t) {
  const i = Number(e.height) || 0, r = re(t).targets, s = e.shelves.filter((h) => te.includes(h)), n = s.length === te.length && s.every((h, p) => h === te[p]), o = {
    entry: e.entry || void 0,
    start_view: e.start_view === ie.start_view ? void 0 : e.start_view,
    shelves: n ? void 0 : s,
    shelf_limit: e.shelf_limit === ie.shelf_limit ? void 0 : e.shelf_limit,
    poster_size: e.poster_size === ie.poster_size ? void 0 : e.poster_size,
    height: i <= 0 ? void 0 : Math.max(Ei, Math.round(i)),
    show_now_playing: e.show_now_playing ? void 0 : !1,
    show_search: e.show_search ? void 0 : !1,
    default_target: e.default_target || void 0,
    allowed_targets: void 0,
    targets: r.length ? r : void 0
  }, l = Object.fromEntries(Object.entries(t).filter(([h]) => !(h in o)));
  for (const [h, p] of Object.entries(o))
    p !== void 0 && (l[h] = p);
  return l.show_search === !1 && l.start_view === "search" && delete l.start_view, re(l).default_target === null && delete l.default_target, l;
}
function lt(e) {
  return {
    entry: e.entry,
    start_view: e.start_view,
    shelves: [...e.shelves],
    shelf_limit: e.shelf_limit,
    poster_size: e.poster_size,
    height: e.height === "auto" ? 0 : e.height,
    show_now_playing: e.show_now_playing,
    show_search: e.show_search,
    default_target: e.default_target ?? void 0
  };
}
var Ai = Object.defineProperty, Ci = Object.getOwnPropertyDescriptor, L = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? Ci(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (r ? o(t, i, s) : o(s)) || s);
  return r && s && Ai(t, i, s), s;
};
async function Pi() {
  if (customElements.get("ha-form")) return;
  const e = window.loadCardHelpers;
  if (e)
    try {
      await (await e()).createCardElement?.({ type: "entities", entities: [] })?.constructor.getConfigElement?.();
    } catch {
    }
}
let O = class extends C {
  constructor() {
    super(...arguments), this._raw = {}, this._entries = [], this._sessions = [], this._clients = [], this._lang = "en", this._targetForms = [], this._targetError = "", this._formReady = customElements.get("ha-form") !== void 0;
  }
  setConfig(e) {
    const t = re(e);
    (!this._config || JSON.stringify(t.targets) !== JSON.stringify(this._config.targets)) && (this._targetForms = t.targets.map(wi), this._targetError = ""), this._config = t, this._raw = e, this._loadChoices();
  }
  set hass(e) {
    const t = this._hass === void 0;
    this._hass = e, this._lang = mt(e), t && this._loadChoices();
  }
  get hass() {
    return this._hass;
  }
  connectedCallback() {
    super.connectedCallback(), this._formReady || Pi().then(() => customElements.whenDefined("ha-form")).then(() => this._formReady = !0);
  }
  /** Load the users and the clients that are online right now, once per entry. */
  async _loadChoices() {
    const e = this._hass, t = this._config;
    if (!e || !t) return;
    const i = t.entry ?? "";
    if (this._loadedFor === i) return;
    this._loadedFor = i, this._sessions = [], this._clients = [];
    try {
      this._entries = await new we(e).entries();
    } catch {
      this._entries = [];
    }
    const r = t.entry ?? (this._entries.length === 1 ? this._entries[0].entry_id : null);
    if (r !== null)
      try {
        const s = { done: !1 };
        s.stop = await new we(e, r).subscribeSessions((n) => {
          this._sessions = n.sessions, this._clients = n.clients ?? [], s.done = !0, s.stop?.();
        }), s.done ? s.stop() : setTimeout(() => s.stop?.(), 1e4);
      } catch {
        this._sessions = [];
      }
  }
  _t(e) {
    return b(this._lang, e);
  }
  _schema(e) {
    const t = (s, n) => ({ value: s, label: n }), i = /* @__PURE__ */ new Map();
    for (const s of this._clients)
      i.set(s.device_id, `${s.name} (${s.client})`);
    for (const s of e.targets) i.set(s.device_id, s.name);
    for (const s of this._sessions)
      s.controllable && !i.has(s.device_id) && i.set(s.device_id, `${s.device_name} (${s.client})`);
    const r = [...i].filter(([s]) => e.allowed_targets.includes(s));
    return [
      {
        name: "entry",
        selector: {
          select: {
            mode: "dropdown",
            options: this._entries.map((s) => t(s.entry_id, s.title))
          }
        }
      },
      {
        name: "start_view",
        selector: {
          select: {
            mode: "dropdown",
            options: ft.map((s) => t(s, this._t(`nav.${s}`)))
          }
        }
      },
      {
        name: "shelves",
        selector: {
          select: {
            multiple: !0,
            reorder: !0,
            options: te.map((s) => t(s, this._t(`shelf.${s}`)))
          }
        }
      },
      {
        name: "poster_size",
        selector: {
          select: {
            mode: "dropdown",
            options: yt.map((s) => t(s, this._t(`editor.size.${s}`)))
          }
        }
      },
      {
        name: "height",
        selector: {
          number: { min: 0, max: 4e3, step: 10, mode: "box", unit_of_measurement: "px" }
        }
      },
      { name: "show_now_playing", selector: { boolean: {} } },
      { name: "show_search", selector: { boolean: {} } },
      ...r.length > 1 ? [{
        name: "default_target",
        selector: {
          select: {
            mode: "dropdown",
            options: r.map(([s, n]) => t(s, n))
          }
        }
      }] : []
    ];
  }
  _valueChanged(e) {
    e.stopPropagation();
    const t = Si(e.detail.value, this._raw);
    this._emitConfig(t);
  }
  _emitConfig(e) {
    this._raw = e, this._config = re(e), this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config: e }, bubbles: !0, composed: !0 })
    );
  }
  _clientSchema() {
    const e = /* @__PURE__ */ new Map();
    for (const t of this._clients)
      e.set(t.device_id, `${t.name} (${t.client})`);
    for (const t of this._sessions)
      t.controllable && e.set(t.device_id, `${t.device_name} (${t.client})`);
    for (const t of this._targetForms)
      t.device_id && !e.has(t.device_id) && e.set(t.device_id, t.name || t.device_id);
    return [
      { name: "clients", selector: { select: {
        mode: "dropdown",
        multiple: !0,
        custom_value: !0,
        options: [...e].map(([t, i]) => ({ value: t, label: i }))
      } } }
    ];
  }
  _clientsChanged(e) {
    e.stopPropagation(), this._targetForms = [...new Set(e.detail.value.clients)].map((t) => {
      const i = this._targetForms.find((n) => n.device_id === t);
      if (i) return i;
      const r = this._clients.find((n) => n.device_id === t), s = this._sessions.find((n) => n.device_id === t);
      return { device_id: t, name: r?.name || s?.device_name || t };
    }), this._saveTargets();
  }
  _targetSchema() {
    return [
      { name: "name", selector: { text: {} } },
      { name: "volume_entity", selector: { entity: { filter: { domain: "media_player" } } } },
      { name: "control_entity", selector: { entity: { filter: { domain: "media_player" } } } }
    ];
  }
  _saveTargets() {
    try {
      const e = ki(this._raw, this._targetForms);
      this._targetError = "", this._emitConfig(e);
    } catch {
      this._targetError = this._t("editor.target_error");
    }
  }
  _targetChanged(e, t) {
    t.stopPropagation(), this._targetForms = this._targetForms.map((i, r) => r === e ? { ...i, ...t.detail.value } : i), this._saveTargets();
  }
  render() {
    const e = this._config;
    if (!this._hass || !e || !this._formReady) return d;
    const t = this._schema(e), i = t.filter((r) => r.name === "default_target");
    return a`
      <ha-form
        .hass=${this._hass}
        .data=${lt(e)}
        .schema=${t.filter((r) => r.name !== "default_target")}
        .computeLabel=${(r) => this._t(`editor.${r.name}`)}
        @value-changed=${this._valueChanged}
      ></ha-form>
      <p>${this._t("editor.targets_hint")}</p>
      <h3>${this._t("editor.targets")}</h3>
      <ha-form
        .hass=${this._hass}
        .data=${{ clients: this._targetForms.map((r) => r.device_id) }}
        .schema=${this._clientSchema()}
        .computeLabel=${() => this._t("editor.clients")}
        @value-changed=${this._clientsChanged}
      ></ha-form>
      ${this._targetForms.map((r, s) => a`
        <section>
          <h4>${r.name || this._t("editor.new_target")}</h4>
          <ha-form
            .hass=${this._hass}
            .data=${r}
            .schema=${this._targetSchema()}
            .computeLabel=${(n) => this._t(`editor.target.${n.name}`)}
            @value-changed=${(n) => this._targetChanged(s, n)}
          ></ha-form>
        </section>
      `)}
      ${this._targetError ? a`<p class="error" role="alert">${this._targetError}</p>` : d}
      ${i.length ? a`
        <ha-form
          .hass=${this._hass}
          .data=${lt(e)}
          .schema=${i}
          .computeLabel=${(r) => this._t(`editor.${r.name}`)}
          @value-changed=${this._valueChanged}
        ></ha-form>
      ` : d}
    `;
  }
};
O.styles = D`
    section {
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 16px;
      margin: 12px 0;
    }
    h4 { margin: 0 0 16px; }
    .error { color: var(--error-color); }
    p {
      margin: 16px 0 0;
      color: var(--secondary-text-color);
      font-size: 0.9em;
    }
  `;
L([
  c()
], O.prototype, "_raw", 2);
L([
  c()
], O.prototype, "_config", 2);
L([
  c()
], O.prototype, "_entries", 2);
L([
  c()
], O.prototype, "_sessions", 2);
L([
  c()
], O.prototype, "_clients", 2);
L([
  c()
], O.prototype, "_lang", 2);
L([
  c()
], O.prototype, "_targetForms", 2);
L([
  c()
], O.prototype, "_targetError", 2);
L([
  c()
], O.prototype, "_formReady", 2);
O = L([
  z("emby-library-card-editor")
], O);
const Oi = {
  emby_unreachable: "error.unreachable",
  emby_auth_failed: "error.auth",
  entry_required: "error.entry_required",
  entry_not_found: "error.entry_not_found",
  not_found: "error.not_found",
  unsupported_command: "error.unsupported",
  session_not_found: "target.lost",
  not_controllable: "target.lost"
};
function ve(e, t) {
  return b(e, Oi[t] ?? "error.generic");
}
function V(e, t, i) {
  const r = i !== void 0 && (t === "emby_unreachable" || t === "unknown");
  return a`
    <div class="state error" role="alert">
      <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
      <div>${ve(e, t)}</div>
      ${r ? a`<button class="button" @click=${i}>
            <ha-icon icon="mdi:refresh"></ha-icon>${b(e, "error.retry")}
          </button>` : d}
    </div>
  `;
}
function ge(e, t = "mdi:movie-open-outline") {
  return a`
    <div class="state" role="status">
      <ha-icon icon=${t}></ha-icon>
      <div>${e}</div>
    </div>
  `;
}
var Mi = Object.defineProperty, Ti = Object.getOwnPropertyDescriptor, le = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? Ti(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (r ? o(t, i, s) : o(s)) || s);
  return r && s && Mi(t, i, s), s;
};
const Ii = {
  Movie: "mdi:movie-outline",
  Series: "mdi:television-classic",
  Season: "mdi:television-classic",
  Episode: "mdi:television-play",
  BoxSet: "mdi:filmstrip-box-multiple",
  Folder: "mdi:folder-outline",
  Video: "mdi:video-outline"
}, bt = (e) => Ii[e] ?? "mdi:video-outline";
let q = class extends C {
  constructor() {
    super(...arguments), this.shape = "poster", this.language = "en", this._failed = !1;
  }
  willUpdate(e) {
    (e.has("item") || e.has("shape")) && (this._failed = !1);
  }
  render() {
    const e = this.item, { title: t, subtitle: i } = this.caption ?? ii(e), r = this._failed ? null : ti(e, this.shape), s = e.progress > 0 && e.progress < 1, n = [t, i, e.played ? b(this.language, "detail.played") : ""].filter(Boolean).join(", ");
    return a`
      <button class="tile" aria-label=${n} @click=${this._open}>
        <div class="image ${this.shape}">
          ${r ? a`<img
                src=${r}
                alt=${e.name}
                loading="lazy"
                decoding="async"
                @error=${this._onError}
              />` : a`<div class="placeholder">
                <ha-icon icon=${bt(e.type)}></ha-icon>
                <span>${e.name}</span>
              </div>`}
          ${e.played ? a`<span class="badge" aria-hidden="true"
                ><ha-icon icon="mdi:check"></ha-icon
              ></span>` : e.unplayed_count ? a`<span class="badge count" aria-hidden="true">${e.unplayed_count}</span>` : d}
          ${s ? a`<div class="progress" aria-hidden="true">
                <div style="width:${Math.round(e.progress * 100)}%"></div>
              </div>` : d}
        </div>
        <div class="title">${t}</div>
        <div class="subtitle">${i || a`&nbsp;`}</div>
      </button>
    `;
  }
  _onError() {
    this._failed = !0;
  }
  _open() {
    P(this, "emby-open-item", { item: this.item });
  }
};
q.styles = [
  F,
  D`
      :host {
        display: block;
        min-width: 0;
      }
      .tile {
        display: block;
        width: 100%;
        text-align: left;
        border-radius: var(--el-tile-radius);
      }
      .image {
        position: relative;
        width: 100%;
        overflow: hidden;
        border-radius: var(--el-tile-radius);
        background: var(--el-surface);
      }
      .image.poster {
        aspect-ratio: 2 / 3;
      }
      .image.still {
        aspect-ratio: 16 / 9;
      }
      img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.2s ease;
      }
      .tile:hover img {
        transform: scale(1.04);
      }
      @media (prefers-reduced-motion: reduce) {
        img {
          transition: none;
        }
      }
      .placeholder {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 8px;
        text-align: center;
        color: var(--el-muted);
        font-size: 0.85em;
        overflow: hidden;
      }
      .placeholder span {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        overflow-wrap: anywhere;
      }
      .placeholder ha-icon {
        --mdc-icon-size: 32px;
      }
      .badge {
        position: absolute;
        top: 6px;
        right: 6px;
        min-width: 22px;
        height: 22px;
        padding: 0 6px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 11px;
        background: var(--el-accent);
        color: var(--el-on-accent);
        font-size: 12px;
        font-weight: 600;
        --mdc-icon-size: 16px;
      }
      .badge:not(.count) {
        padding: 0;
      }
      .progress {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 4px;
        background: rgba(0, 0, 0, 0.5);
      }
      .progress div {
        height: 100%;
        background: var(--el-accent);
      }
      .title,
      .subtitle {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        line-height: 1.35;
      }
      .title {
        margin-top: 6px;
        font-size: 0.9em;
        font-weight: 500;
      }
      .subtitle {
        font-size: 0.8em;
        color: var(--el-muted);
      }
    `
];
le([
  _({ attribute: !1 })
], q.prototype, "item", 2);
le([
  _()
], q.prototype, "shape", 2);
le([
  _()
], q.prototype, "language", 2);
le([
  _({ attribute: !1 })
], q.prototype, "caption", 2);
le([
  c()
], q.prototype, "_failed", 2);
q = le([
  z("emby-library-poster")
], q);
var Ni = Object.defineProperty, Di = Object.getOwnPropertyDescriptor, k = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? Di(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (r ? o(t, i, s) : o(s)) || s);
  return r && s && Ni(t, i, s), s;
};
let w = class extends C {
  constructor() {
    super(...arguments), this.language = "en", this.itemId = "", this.refreshKey = 0, this._item = null, this._error = null, this._seasons = [], this._seasonId = null, this._episodes = null, this._expanded = !1, this._clamped = !1, this._posterFailed = !1, this._backdropFailed = !1, this._playedBusy = !1, this._playedError = null, this._trailerIndex = null, this._generation = 0;
  }
  _t(e, t) {
    return b(this.language, e, t);
  }
  willUpdate(e) {
    e.has("api") || e.has("itemId") ? (this._item = null, this._seasons = [], this._seasonId = null, this._episodes = null, this._expanded = !1, this._posterFailed = !1, this._backdropFailed = !1, this._trailerIndex = null, this._playedError = null, this._load()) : e.has("refreshKey") && this._load();
  }
  updated() {
    const e = this._overview;
    if (e && !this._expanded) {
      const t = e.scrollHeight > e.clientHeight + 1;
      t !== this._clamped && (this._clamped = t);
    }
  }
  async _load() {
    const e = ++this._generation;
    this._error = null;
    try {
      const t = await this.api.item(this.itemId);
      if (e !== this._generation) return;
      if (this._item = t, t.type === "Series") {
        const i = await this.api.seasons(t.id);
        if (e !== this._generation) return;
        this._seasons = i;
        const r = i.find((s) => s.id === this._seasonId) ?? i.find((s) => !s.played && s.unplayed_count !== 0) ?? i[0];
        this._seasonId = r?.id ?? null, r ? await this._loadEpisodes(t.id, r.id, e) : this._episodes = [];
      } else t.type === "Season" && t.series_id && await this._loadEpisodes(t.series_id, t.id, e);
    } catch (t) {
      if (e !== this._generation) return;
      const i = A(t).code;
      i === "not_found" ? P(this, "emby-error", { code: i }) : this._error = i;
    }
  }
  async _loadEpisodes(e, t, i) {
    const r = await this.api.episodes(e, t);
    i === this._generation && (this._episodes = r);
  }
  async _selectSeason(e) {
    if (!this._item || e === this._seasonId) return;
    const t = ++this._generation;
    this._seasonId = e, this._episodes = null;
    try {
      await this._loadEpisodes(this._item.id, e, t);
    } catch (i) {
      t === this._generation && (this._error = A(i).code);
    }
  }
  _play(e) {
    this._item && P(this, "emby-play", { itemId: this._item.id, mode: e });
  }
  async _setPlayed(e) {
    if (this._playedBusy) return;
    const t = this.itemId;
    this._playedBusy = !0, this._playedError = null;
    try {
      await this.api.setPlayed(e.id, !e.played), P(this, "emby-library-changed", {}), this.itemId === t && await this._load();
    } catch (i) {
      this.itemId === t && (this._playedError = A(i).code);
    } finally {
      this._playedBusy = !1;
    }
  }
  _open(e) {
    P(this, "emby-open-item", { item: e });
  }
  render() {
    if (this._error !== null)
      return V(this.language, this._error, () => void this._load());
    const e = this._item;
    if (e === null) return this._renderSkeleton();
    const t = e.type === "Episode", i = this._backdropFailed ? null : e.images.backdrop ?? e.images.still, r = this._posterFailed ? null : t ? e.images.still ?? e.images.poster : e.images.poster, s = t ? gt(e) : "", n = this._trailerIndex !== null ? e.trailers?.[this._trailerIndex] : void 0;
    return a`
      <div class="hero ${i ? "with-backdrop" : ""}">
        ${i ? a`<img
              class="backdrop"
              src=${i}
              alt=""
              decoding="async"
              @error=${() => this._backdropFailed = !0}
            />` : d}
        <div class="hero-content">
          <div class="poster ${t ? "still" : ""}">
            ${r ? a`<img
                  src=${r}
                  alt=${e.name}
                  decoding="async"
                  @error=${() => this._posterFailed = !0}
                />` : a`<div class="placeholder">
                  <ha-icon icon=${bt(e.type)}></ha-icon>
                </div>`}
            ${e.progress > 0 && e.progress < 1 ? a`<div class="progress" aria-hidden="true">
                  <div style="width:${Math.round(e.progress * 100)}%"></div>
                </div>` : d}
          </div>
          <div class="info">
            ${t && e.series_id && e.series_name ? a`<button
                  class="series-link"
                  aria-label=${this._t("detail.open_series", { name: e.series_name })}
                  @click=${() => this._open({
      id: e.series_id,
      type: "Series",
      name: e.series_name,
      is_folder: !0
    })}
                >
                  ${e.series_name}
                </button>` : d}
            <h2>${s ? a`<span class="muted">${s} · </span>` : d}${e.name}</h2>
            ${this._renderMeta(e)}
            ${e.genres.length > 0 ? a`<div class="genres muted">${e.genres.slice(0, 4).join(" · ")}</div>` : d}
          </div>
        </div>
      </div>

      <div class="body">
        <div class="actions">
          ${this._renderActions(e)}
          ${["Movie", "Episode", "Video", "Series", "Season"].includes(e.type) ? a`
            <button class="button" ?disabled=${this._playedBusy} @click=${() => void this._setPlayed(e)}>
              <ha-icon icon=${e.played ? "mdi:eye-off-outline" : "mdi:check-circle-outline"}></ha-icon>
              ${this._t(this._playedBusy ? "detail.saving" : e.type === "Series" || e.type === "Season" ? e.played ? "detail.mark_all_unplayed" : "detail.mark_all_played" : e.played ? "detail.mark_unplayed" : "detail.mark_played")}
            </button>` : d}
          ${(e.trailers ?? []).map((o, l) => a`
            <button class="button" aria-pressed=${this._trailerIndex === l ? "true" : "false"}
              @click=${() => this._trailerIndex = this._trailerIndex === l ? null : l}>
              <ha-icon icon="mdi:movie-open-play-outline"></ha-icon>${this._t("detail.trailer")}${(e.trailers?.length ?? 0) > 1 ? ` ${l + 1}` : ""}
            </button>`)}
        </div>
        ${this._playedError ? V(this.language, this._playedError, () => void this._setPlayed(e)) : d}
        ${n ? a`
          <iframe class="trailer" src=${n.embed_url}
            title=${this._t("detail.trailer")} referrerpolicy="strict-origin-when-cross-origin"
            allow="encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>
        ` : d}
        ${(e.media_sources?.length ?? 0) > 0 ? a`
          <section class="quality" aria-label=${this._t("detail.quality")}>
            <h3>${this._t("detail.quality")}</h3>
            ${e.media_sources.map((o) => a`<p>${[
      o.width && o.height ? `${o.width} × ${o.height}` : o.height ? `${o.height}p` : null,
      o.video_codec?.toUpperCase(),
      o.video_range,
      o.color_transfer === "smpte2084" ? "HDR (PQ)" : o.color_transfer === "arib-std-b67" ? "HDR (HLG)" : null,
      o.container?.toUpperCase(),
      o.size_bytes ? `${(o.size_bytes / 1024 ** 3).toFixed(2)} GiB` : null
    ].filter(Boolean).join(" · ")}</p>`)}
          </section>` : d}
        ${e.overview ? a`
              <p class="overview ${this._expanded ? "expanded" : ""}">${e.overview}</p>
              ${this._clamped || this._expanded ? a`<button
                    class="more"
                    aria-expanded=${this._expanded ? "true" : "false"}
                    @click=${() => this._expanded = !this._expanded}
                  >
                    ${this._t(this._expanded ? "detail.show_less" : "detail.show_more")}
                  </button>` : d}
            ` : d}
        ${e.type === "Series" || e.type === "Season" ? this._renderEpisodes(e) : d}
      </div>
    `;
  }
  _renderMeta(e) {
    const t = [];
    e.year !== null && t.push(String(e.year));
    const i = Te(e.runtime_s, this._t("time.h"), this._t("time.min"));
    if (i && t.push(i), e.type === "Series" && e.season_count && t.push(
      e.season_count === 1 ? this._t("detail.season_count_one") : this._t("detail.season_count", { count: e.season_count })
    ), e.official_rating && t.push(a`<span class="rating-box">${e.official_rating}</span>`), e.community_rating !== null) {
      const r = e.community_rating.toFixed(1);
      t.push(
        a`<span class="stars" aria-label=${this._t("detail.rating", { rating: r })}
          ><ha-icon icon="mdi:star"></ha-icon>${r}</span
        >`
      );
    }
    return e.played ? t.push(
      a`<span class="stars"
          ><ha-icon icon="mdi:check-circle"></ha-icon>${this._t("detail.played")}</span
        >`
    ) : e.unplayed_count && t.push(this._t("detail.unplayed_count", { count: e.unplayed_count })), a`<div class="meta">${t.map((r) => a`<span>${r}</span>`)}</div>`;
  }
  _renderActions(e) {
    return e.type === "Series" || e.type === "Season" ? a`<button class="button primary" @click=${() => this._play("resume")}>
        <ha-icon icon="mdi:play"></ha-icon>${this._t("detail.play")}
      </button>` : e.type === "BoxSet" || e.type === "Folder" ? d : e.position_s > 0 ? a`
        <button class="button primary" @click=${() => this._play("resume")}>
          <ha-icon icon="mdi:play"></ha-icon>${this._t("detail.resume")}
        </button>
        <button class="button" @click=${() => this._play("start")}>
          <ha-icon icon="mdi:restart"></ha-icon>${this._t("detail.play_from_start")}
        </button>
      ` : a`<button class="button primary" @click=${() => this._play("start")}>
      <ha-icon icon="mdi:play"></ha-icon>${this._t("detail.play_from_start")}
    </button>`;
  }
  _renderEpisodes(e) {
    return a`
      ${e.type === "Series" && this._seasons.length > 0 ? a`<div class="seasons" role="tablist" aria-label=${this._t("detail.seasons")}>
            ${this._seasons.map(
      (t) => a`<button
                  class="chip"
                  role="tab"
                  aria-selected=${t.id === this._seasonId ? "true" : "false"}
                  @click=${() => void this._selectSeason(t.id)}
                >
                  ${t.name}
                </button>`
    )}
          </div>` : d}
      <h3>${this._t("detail.episodes")}</h3>
      ${this._episodes === null ? a`<div aria-busy="true">
            ${Array.from({ length: 4 }, () => a`<div class="skeleton episode-skel"></div>`)}
          </div>` : this._episodes.length === 0 ? a`<div class="muted" role="status">${this._t("detail.no_episodes")}</div>` : a`<div class="episodes" role="list">
              ${oe(
      this._episodes,
      (t) => t.id,
      (t) => this._renderEpisode(t)
    )}
            </div>`}
    `;
  }
  _renderEpisode(e) {
    const t = Te(e.runtime_s, this._t("time.h"), this._t("time.min")), i = e.episode_number !== null ? `${e.episode_number}. ` : "", r = e.images.still;
    return a`
      <div role="listitem">
        <button class="episode" @click=${() => this._open(e)}>
          <span class="thumb">
            ${r ? a`<img
                  src=${r}
                  alt=${e.name}
                  loading="lazy"
                  decoding="async"
                  @error=${(s) => s.target.remove()}
                />` : d}
            <ha-icon class="thumb-icon" icon="mdi:television-play"></ha-icon>
            ${e.progress > 0 && e.progress < 1 ? a`<span class="progress" aria-hidden="true"
                  ><span style="width:${Math.round(e.progress * 100)}%"></span
                ></span>` : d}
          </span>
          <span class="episode-text">
            <span class="episode-title">${i}${e.name}</span>
            ${t ? a`<span class="muted small">${t}</span>` : d}
          </span>
          ${e.played ? a`<ha-icon
                class="seen"
                icon="mdi:check-circle"
                role="img"
                aria-label=${this._t("detail.played")}
              ></ha-icon>` : d}
        </button>
      </div>
    `;
  }
  _renderSkeleton() {
    return a`
      <div class="hero" aria-busy="true">
        <div class="hero-content">
          <div class="poster skeleton"></div>
          <div class="info">
            <div class="skeleton" style="height:1.6em;width:60%"></div>
            <div class="skeleton" style="height:1em;width:40%;margin-top:12px"></div>
          </div>
        </div>
      </div>
      <div class="body">
        <div class="skeleton" style="height:44px;width:160px;border-radius:22px"></div>
        <div class="skeleton" style="height:4.5em;margin-top:16px"></div>
      </div>
    `;
  }
};
w.styles = [
  F,
  D`
      :host {
        display: block;
        container-type: inline-size;
      }
      .hero {
        position: relative;
        overflow: hidden;
      }
      .hero.with-backdrop {
        color: #fff;
        background: #000;
      }
      .backdrop {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0.55;
      }
      .hero.with-backdrop::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.85));
      }
      .hero-content {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: flex-end;
        gap: 16px;
        padding: 16px;
        min-height: 180px;
      }
      .hero.with-backdrop .hero-content {
        padding-top: 72px;
      }
      .poster {
        position: relative;
        flex: 0 0 var(--el-poster-width, 150px);
        aspect-ratio: 2 / 3;
        overflow: hidden;
        border-radius: var(--el-tile-radius);
        background: var(--el-surface);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      }
      .poster.still {
        flex-basis: calc(var(--el-poster-width, 150px) * 1.5);
        aspect-ratio: 16 / 9;
      }
      .poster img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .placeholder {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--el-muted);
        --mdc-icon-size: 40px;
      }
      .progress {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 4px;
        background: rgba(0, 0, 0, 0.5);
        display: block;
      }
      .progress > * {
        display: block;
        height: 100%;
        background: var(--el-accent);
      }
      .info {
        flex: 1;
        min-width: 0;
      }
      h2 {
        margin: 0;
        font-size: 1.5em;
        font-weight: 500;
        line-height: 1.2;
        overflow-wrap: anywhere;
      }
      .hero.with-backdrop .muted {
        color: rgba(255, 255, 255, 0.75);
      }
      .series-link {
        min-height: 44px;
        font-weight: 500;
        text-align: left;
        text-decoration: underline;
        text-underline-offset: 3px;
      }
      .meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px 12px;
        margin-top: 8px;
        font-size: 0.9em;
      }
      .rating-box {
        padding: 0 6px;
        border: 1px solid currentColor;
        border-radius: 4px;
        font-size: 0.85em;
      }
      .stars {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        --mdc-icon-size: 16px;
      }
      .genres {
        margin-top: 4px;
        font-size: 0.85em;
      }
      .body {
        padding: 16px;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .trailer { display: block; width: 100%; aspect-ratio: 16 / 9; border: 0; margin-top: 16px; border-radius: 8px; }
      .quality p { color: var(--el-muted); margin: 8px 0; overflow-wrap: anywhere; }
      .overview {
        margin: 16px 0 0;
        line-height: 1.5;
        white-space: pre-line;
        overflow-wrap: anywhere;
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .overview.expanded {
        display: block;
      }
      .more {
        min-height: 44px;
        color: var(--el-accent);
        font-weight: 500;
      }
      .seasons {
        display: flex;
        gap: 8px;
        margin-top: 20px;
        padding-bottom: 6px;
        overflow-x: auto;
        scrollbar-width: thin;
      }
      h3 {
        margin: 16px 0 8px;
        font-size: 1.05em;
        font-weight: 500;
      }
      .episode {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        min-height: 44px;
        padding: 6px;
        border-radius: var(--el-tile-radius);
        text-align: left;
      }
      .episode:hover {
        background: var(--el-surface);
      }
      .thumb {
        position: relative;
        flex: 0 0 128px;
        aspect-ratio: 16 / 9;
        overflow: hidden;
        border-radius: 6px;
        background: var(--el-surface);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--el-muted);
      }
      .thumb img {
        position: absolute;
        inset: 0;
        z-index: 1;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .thumb .progress {
        z-index: 2;
      }
      .episode-text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .episode-title {
        overflow-wrap: anywhere;
      }
      .small {
        font-size: 0.85em;
      }
      .seen {
        color: var(--el-accent);
        --mdc-icon-size: 20px;
      }
      .episode-skel {
        height: 84px;
        margin-bottom: 8px;
      }
      @container (max-width: 460px) {
        .hero-content {
          gap: 12px;
        }
        .poster {
          flex-basis: 96px;
        }
        .poster.still {
          flex-basis: 128px;
        }
        h2 {
          font-size: 1.2em;
        }
        .thumb {
          flex-basis: 96px;
        }
      }
    `
];
k([
  _({ attribute: !1 })
], w.prototype, "api", 2);
k([
  _()
], w.prototype, "language", 2);
k([
  _()
], w.prototype, "itemId", 2);
k([
  _({ type: Number })
], w.prototype, "refreshKey", 2);
k([
  c()
], w.prototype, "_item", 2);
k([
  c()
], w.prototype, "_error", 2);
k([
  c()
], w.prototype, "_seasons", 2);
k([
  c()
], w.prototype, "_seasonId", 2);
k([
  c()
], w.prototype, "_episodes", 2);
k([
  c()
], w.prototype, "_expanded", 2);
k([
  c()
], w.prototype, "_clamped", 2);
k([
  c()
], w.prototype, "_posterFailed", 2);
k([
  c()
], w.prototype, "_backdropFailed", 2);
k([
  c()
], w.prototype, "_playedBusy", 2);
k([
  c()
], w.prototype, "_playedError", 2);
k([
  c()
], w.prototype, "_trailerIndex", 2);
k([
  Q(".overview")
], w.prototype, "_overview", 2);
w = k([
  z("emby-library-detail")
], w);
var Ri = Object.defineProperty, zi = Object.getOwnPropertyDescriptor, W = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? zi(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (r ? o(t, i, s) : o(s)) || s);
  return r && s && Ri(t, i, s), s;
};
let R = class extends C {
  constructor() {
    super(...arguments), this.heading = "", this.items = null, this.shape = "poster", this.language = "en", this.posterWidth = 150, this._columns = 1;
  }
  connectedCallback() {
    super.connectedCallback(), this.updateComplete.then(() => {
      !this.isConnected || !this._row || (this._resizeObserver ??= new ResizeObserver(() => this._measure()), this._resizeObserver.observe(this._row), this._measure());
    });
  }
  disconnectedCallback() {
    this._resizeObserver?.disconnect(), super.disconnectedCallback();
  }
  updated() {
    this._measure();
  }
  _measure() {
    const e = this._row;
    if (!e) return;
    const t = getComputedStyle(e), i = e.clientWidth - parseFloat(t.paddingLeft) - parseFloat(t.paddingRight), r = parseFloat(t.columnGap) || 0, s = this.posterWidth * (this.shape === "still" ? 1.75 : 1);
    this._columns = Math.max(1, Math.floor((i + r) / (s + r)));
  }
  render() {
    return a`
      <section aria-label=${this.heading}>
        <h3>${this.heading}</h3>
        <div
          class="row ${this.shape}"
          style=${`grid-template-columns: repeat(${this._columns}, minmax(0, 1fr))`}
          role="list"
          aria-busy=${this.items === null ? "true" : "false"}
        >
          ${this.items === null ? Array.from(
      { length: this._columns },
      () => a`<div class="cell" aria-hidden="true">
                  <div class="skeleton image"></div>
                  <div class="skeleton line"></div>
                </div>`
    ) : oe(
      this.items.slice(0, this._columns),
      (e) => e.id,
      (e) => a`<div class="cell" role="listitem">
                    <emby-library-poster
                      .item=${e}
                      .shape=${this.shape}
                      .language=${this.language}
                    ></emby-library-poster>
                  </div>`
    )}
        </div>
      </section>
    `;
  }
};
R.styles = [
  F,
  D`
      :host {
        display: block;
        min-width: 0;
      }
      h3 {
        margin: 0 0 8px;
        padding: 0 16px;
        font-size: 1.05em;
        font-weight: 500;
      }
      .row {
        display: grid;
        gap: 16px var(--el-gap);
        padding: 2px 16px 10px;
      }
      .cell {
        min-width: 0;
      }
      .skeleton.image {
        aspect-ratio: 2 / 3;
      }
      .row.still .skeleton.image {
        aspect-ratio: 16 / 9;
      }
      .skeleton.line {
        height: 0.9em;
        margin: 8px 0 1.4em;
        width: 70%;
      }
    `
];
W([
  _()
], R.prototype, "heading", 2);
W([
  _({ attribute: !1 })
], R.prototype, "items", 2);
W([
  _()
], R.prototype, "shape", 2);
W([
  _()
], R.prototype, "language", 2);
W([
  _({ type: Number })
], R.prototype, "posterWidth", 2);
W([
  c()
], R.prototype, "_columns", 2);
W([
  Q(".row")
], R.prototype, "_row", 2);
R = W([
  z("emby-library-shelf")
], R);
var Li = Object.defineProperty, ji = Object.getOwnPropertyDescriptor, H = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? ji(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (r ? o(t, i, s) : o(s)) || s);
  return r && s && Li(t, i, s), s;
};
const Fi = {
  resume: "shelf.resume",
  next_up: "shelf.next_up",
  latest: "shelf.latest",
  suggestions: "shelf.suggestions"
};
let N = class extends C {
  constructor() {
    super(...arguments), this.language = "en", this.shelves = [], this.limit = 20, this.posterWidth = 150, this.refreshKey = 0, this._rows = {}, this._error = null, this._generation = 0;
  }
  willUpdate(e) {
    e.has("api") || e.has("shelves") || e.has("limit") ? this._load(!1) : e.has("refreshKey") && this._load(!0);
  }
  _load(e) {
    const t = ++this._generation, i = {};
    for (const o of this.shelves) {
      const l = this._rows[o];
      i[o] = e && Array.isArray(l) ? l : "loading";
    }
    this._rows = i, this._error = null;
    let r = 0, s = "unknown";
    const n = this.shelves.map(async (o) => {
      let l;
      try {
        const h = await this.api.shelf(o, this.limit);
        l = h.length > 0 ? h : "hidden";
      } catch (h) {
        r += 1, s = A(h).code, l = "hidden";
      }
      t === this._generation && (this._rows = { ...this._rows, [o]: l });
    });
    Promise.all(n).then(() => {
      t === this._generation && this.shelves.length > 0 && r === this.shelves.length && (this._error = s);
    });
  }
  render() {
    if (this._error !== null) return V(this.language, this._error, () => this._load(!1));
    const e = this.shelves.filter((t) => this._rows[t] !== "hidden");
    return e.length === 0 ? ge(b(this.language, "home.empty")) : a`
      ${e.map((t) => {
      const i = this._rows[t];
      return i === void 0 ? d : a`<emby-library-shelf
          .heading=${b(this.language, Fi[t])}
          .items=${i === "loading" ? null : i}
          .shape=${t === "resume" ? "still" : "poster"}
          .language=${this.language}
          .posterWidth=${this.posterWidth}
        ></emby-library-shelf>`;
    })}
    `;
  }
};
N.styles = [
  F,
  D`
      :host {
        display: block;
        padding: 8px 0;
      }
      emby-library-shelf + emby-library-shelf {
        margin-top: 8px;
      }
    `
];
H([
  _({ attribute: !1 })
], N.prototype, "api", 2);
H([
  _()
], N.prototype, "language", 2);
H([
  _({ attribute: !1 })
], N.prototype, "shelves", 2);
H([
  _({ type: Number })
], N.prototype, "limit", 2);
H([
  _({ type: Number })
], N.prototype, "posterWidth", 2);
H([
  _({ type: Number })
], N.prototype, "refreshKey", 2);
H([
  c()
], N.prototype, "_rows", 2);
H([
  c()
], N.prototype, "_error", 2);
N = H([
  z("emby-library-home")
], N);
var Ui = Object.defineProperty, Hi = Object.getOwnPropertyDescriptor, v = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? Hi(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (r ? o(t, i, s) : o(s)) || s);
  return r && s && Ui(t, i, s), s;
};
const Bi = 60, Pe = 600, Vi = 120, Ki = 240, qi = [
  "SortName",
  "DateCreated",
  "PremiereDate",
  "CommunityRating",
  "DatePlayed"
], Wi = {
  movies: "mdi:movie-outline",
  tvshows: "mdi:television-classic",
  boxsets: "mdi:filmstrip-box-multiple",
  mixed: "mdi:folder-play-outline"
};
let f = class extends C {
  constructor() {
    super(...arguments), this.language = "en", this.parent = null, this.refreshKey = 0, this._views = null, this._items = [], this._total = null, this._loading = !1, this._error = null, this._sortBy = "SortName", this._sortOrder = "asc", this._filter = "", this._genre = "", this._year = "", this._runtime = "", this._rating = "", this._statistics = null, this._statsError = null, this._randomBusy = !1, this._randomEmpty = !1, this._randomError = null, this._windowStart = 0, this._spacer = 0, this._generation = 0;
  }
  connectedCallback() {
    super.connectedCallback(), this._observer = new IntersectionObserver((e) => this._onIntersect(e), {
      rootMargin: "800px 0px"
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._observer?.disconnect(), this._observer = void 0;
  }
  willUpdate(e) {
    e.has("api") || e.has("parent") ? (e.has("parent") && (this._filter = "", this._genre = this._year = this._runtime = this._rating = ""), this._reload()) : e.has("refreshKey") && (this._error !== null || this.parent === null) && this._reload();
  }
  updated() {
    const e = this._observer;
    e && (e.disconnect(), this._bottom && e.observe(this._bottom), this._spacerElement && this._windowStart > 0 && e.observe(this._spacerElement));
  }
  _reload() {
    this._generation += 1, this._error = null, this._items = [], this._total = null, this._windowStart = 0, this._spacer = 0, this._loading = !1, this._randomEmpty = !1, this._randomError = null, this.parent === null ? this._loadViews() : this._loadMore();
  }
  async _loadViews() {
    const e = this._generation;
    this._views = null;
    try {
      const t = await this.api.views();
      e === this._generation && (this._views = t), e === this._generation && this._loadStatistics(e);
    } catch (t) {
      e === this._generation && (this._error = A(t).code);
    }
  }
  async _loadStatistics(e) {
    this._statistics = null, this._statsError = null;
    try {
      const t = await this.api.statistics();
      e === this._generation && (this._statistics = t);
    } catch (t) {
      e === this._generation && (this._statsError = A(t).code);
    }
  }
  _query() {
    return {
      parent_id: this.parent.id,
      filter: this._filter || void 0,
      genre: this._genre.trim() || void 0,
      year: this._year ? Number(this._year) : void 0,
      max_runtime_minutes: this._runtime ? Number(this._runtime) : void 0,
      max_official_rating: this._rating.trim() || void 0
    };
  }
  async _random() {
    if (!this.parent || this._randomBusy) return;
    const e = this._generation;
    this._randomBusy = !0, this._randomEmpty = !1, this._randomError = null;
    try {
      const t = await this.api.random(this._query());
      if (e !== this._generation) return;
      t ? P(this, "emby-open-item", { item: t }) : this._randomEmpty = !0;
    } catch (t) {
      e === this._generation && (this._randomError = A(t).code);
    } finally {
      this._randomBusy = !1;
    }
  }
  _setFilterField(e, t) {
    const i = t.target;
    i.reportValidity() && (e === "genre" && (this._genre = i.value), e === "year" && (this._year = i.value), e === "runtime" && (this._runtime = i.value), e === "rating" && (this._rating = i.value), this._reload());
  }
  get _hasMore() {
    return this._total === null || this._items.length < this._total;
  }
  async _loadMore() {
    if (this.parent === null || this._loading || !this._hasMore || this._error !== null) return;
    const e = this._generation;
    this._loading = !0;
    try {
      const t = await this.api.items({
        ...this._query(),
        sort_by: this._sortBy,
        sort_order: this._sortOrder,
        start_index: this._items.length,
        limit: Bi
      });
      if (e !== this._generation) return;
      this._items = [...this._items, ...t.items], this._total = t.items.length === 0 ? this._items.length : t.total, this._setWindow(
        li(this._windowStart, this._items.length, Pe, this._columns())
      );
    } catch (t) {
      e === this._generation && (this._error = A(t).code);
    } finally {
      e === this._generation && (this._loading = !1);
    }
  }
  _columns() {
    if (!this._grid) return 1;
    const e = getComputedStyle(this._grid).gridTemplateColumns;
    return Math.max(1, e.split(" ").filter(Boolean).length);
  }
  _rowHeight() {
    const e = this._grid, t = e?.querySelector("emby-library-poster");
    if (!e || !t) return 0;
    const i = Number.parseFloat(getComputedStyle(e).rowGap) || 0;
    return t.getBoundingClientRect().height + i;
  }
  /** Move the DOM window and keep the scroll position with a spacer. */
  _setWindow(e) {
    const t = Math.max(0, e);
    if (t === this._windowStart) return;
    const i = this._columns();
    this._spacer = Math.floor(t / i) * this._rowHeight(), this._windowStart = t;
  }
  _onIntersect(e) {
    for (const t of e) {
      if (!t.isIntersecting) continue;
      const i = this._columns();
      if (t.target === this._bottom)
        this._windowStart + Pe < this._items.length ? this._setWindow(this._windowStart + Math.ceil(Vi / i) * i) : this._loadMore();
      else if (t.target === this._spacerElement && this._windowStart > 0) {
        const r = this._rowHeight();
        if (r <= 0) continue;
        const s = Math.max(0, t.intersectionRect.top - t.boundingClientRect.top), n = Math.ceil(Ki / i), o = Math.floor(s / r) - n;
        this._setWindow(Math.min(Math.max(0, o * i), this._windowStart - i));
      }
    }
  }
  _openView(e) {
    P(this, "emby-open-item", {
      item: { id: e.id, type: "Folder", name: e.name, is_folder: !0 }
    });
  }
  _setSort(e) {
    this._sortBy = e.target.value, this._reload();
  }
  _toggleOrder() {
    this._sortOrder = this._sortOrder === "asc" ? "desc" : "asc", this._reload();
  }
  render() {
    return this.parent === null ? this._renderViews() : this._renderGrid();
  }
  _renderViews() {
    return this._error !== null ? V(this.language, this._error, () => this._reload()) : this._views === null ? a`<div class="views" aria-busy="true">
        ${Array.from({ length: 4 }, () => a`<div class="skeleton view"></div>`)}
      </div>` : this._views.length === 0 ? ge(b(this.language, "library.no_views"), "mdi:folder-off-outline") : a`
      <section class="statistics" aria-label=${b(this.language, "stats.title")}>
        <h3>${b(this.language, "stats.title")}</h3>
        ${this._statistics ? a`<div class="stats-grid">
          ${["movies", "series", "episodes", "unplayed_episodes"].map((e) => a`
            <div><strong>${this._statistics[e]}</strong><span>${b(this.language, `stats.${e}`)}</span></div>
          `)}
          <div><strong>${Te(this._statistics.runtime_s, b(this.language, "time.h"), b(this.language, "time.min")) || `0 ${b(this.language, "time.min")}`}</strong><span>${b(this.language, "stats.runtime")}</span></div>
        </div>` : this._statsError ? V(this.language, this._statsError, () => void this._loadStatistics(this._generation)) : a`<p role="status">${b(this.language, "stats.loading")}</p>`}
      </section>
      <div class="views" role="list">
        ${this._views.map(
      (e) => a`
            <div role="listitem">
              <button class="view" @click=${() => this._openView(e)}>
                ${e.image ? a`<img
                      src=${e.image}
                      alt=${e.name}
                      loading="lazy"
                      decoding="async"
                      @error=${(t) => t.target.remove()}
                    />` : d}
                <span class="view-label">
                  <ha-icon icon=${Wi[e.collection_type]}></ha-icon>
                  <span>${e.name}</span>
                </span>
              </button>
            </div>
          `
    )}
      </div>
    `;
  }
  _renderGrid() {
    const e = (s, n) => b(this.language, s, n), t = this._items.slice(this._windowStart, this._windowStart + Pe), i = this._loading && this._items.length === 0, r = !this._loading && this._error === null && this._items.length === 0;
    return a`
      <div class="toolbar">
        <label class="sort">
          <span class="sr-only">${e("library.sort")}</span>
          <select @change=${this._setSort} .value=${this._sortBy}>
            ${qi.map(
      (s) => a`<option value=${s} ?selected=${s === this._sortBy}>
                  ${e(`sort.${s}`)}
                </option>`
    )}
          </select>
        </label>
        <button
          class="icon-button"
          aria-label=${e(this._sortOrder === "asc" ? "library.order_asc" : "library.order_desc")}
          @click=${this._toggleOrder}
        >
          <ha-icon
            icon=${this._sortOrder === "asc" ? "mdi:sort-ascending" : "mdi:sort-descending"}
          ></ha-icon>
        </button>
        <label><span class="sr-only">${e("filter.status")}</span>
          <select .value=${this._filter} @change=${(s) => {
      this._filter = s.target.value, this._reload();
    }}>
            <option value="">${e("filter.all")}</option>
            <option value="unplayed">${e("library.unplayed")}</option>
            <option value="played">${e("detail.played")}</option>
            <option value="favorites">${e("filter.favorites")}</option>
          </select>
        </label>
        <button class="chip" ?disabled=${this._randomBusy} @click=${() => void this._random()}>
          <ha-icon icon="mdi:dice-multiple"></ha-icon>${e(this._randomBusy ? "random.loading" : "random.choose")}
        </button>
        ${this._total !== null && this._total > 0 ? a`<span class="count muted">${e("library.count", { count: this._total })}</span>` : d}
      </div>
      <div class="filters">
        <label>${e("filter.genre")}<input maxlength="100" .value=${this._genre} @change=${(s) => this._setFilterField("genre", s)} /></label>
        <label>${e("filter.year")}<input type="number" min="1800" max="2200" step="1" .value=${this._year} @change=${(s) => this._setFilterField("year", s)} /></label>
        <label>${e("filter.runtime")}<input type="number" min="1" max="1440" step="1" .value=${this._runtime} @change=${(s) => this._setFilterField("runtime", s)} /></label>
        <label>${e("filter.rating")}<input maxlength="50" placeholder="PG-13" .value=${this._rating} @change=${(s) => this._setFilterField("rating", s)} /></label>
      </div>
      ${this._randomEmpty ? a`<p role="status">${e("random.empty")}</p>` : d}
      ${this._randomError ? V(this.language, this._randomError, () => void this._random()) : d}

      ${r ? ge(e(this._filter === "unplayed" ? "library.empty_unplayed" : "library.empty")) : a`
            <div class="spacer" style="height:${this._spacer}px"></div>
            <div class="grid" role="list" aria-busy=${this._loading ? "true" : "false"}>
              ${oe(
      t,
      (s) => s.id,
      (s) => a`<emby-library-poster
                    role="listitem"
                    .item=${s}
                    .language=${this.language}
                  ></emby-library-poster>`
    )}
              ${i ? Array.from(
      { length: 18 },
      () => a`<div aria-hidden="true">
                      <div class="skeleton poster"></div>
                      <div class="skeleton line"></div>
                    </div>`
    ) : d}
            </div>
          `}
      ${this._error !== null ? V(this.language, this._error, () => {
      this._error = null, this._loadMore();
    }) : d}
      ${this._loading && this._items.length > 0 ? a`<div class="more muted" role="status">${e("library.loading_more")}…</div>` : d}
      <div class="sentinel bottom"></div>
    `;
  }
};
f.styles = [
  F,
  D`
      :host {
        display: block;
        padding: 8px 16px 16px;
      }
      .views {
        display: grid;
        gap: var(--el-gap);
        grid-template-columns: repeat(auto-fill, minmax(min(220px, 100%), 1fr));
      }
      .view {
        position: relative;
        display: block;
        width: 100%;
        aspect-ratio: 16 / 9;
        overflow: hidden;
        border-radius: var(--el-tile-radius);
        background: var(--el-surface);
      }
      .skeleton.view {
        display: block;
      }
      .view img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .view-label {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 24px 12px 10px;
        font-weight: 500;
        text-align: left;
      }
      .view img + .view-label {
        color: #fff;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
      }
      .toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }
      select {
        min-height: 44px;
        padding: 0 12px;
        border-radius: 22px;
        border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
        background: var(--card-background-color, transparent);
        color: var(--primary-text-color);
        font: inherit;
      }
      .filters, .stats-grid { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
      .filters label, .stats-grid > div { display: flex; flex-direction: column; gap: 4px; }
      .filters label { flex: 1 1 140px; font-size: 0.85em; }
      input { box-sizing: border-box; width: 100%; min-height: 44px; padding: 8px; border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color); color: var(--primary-text-color); font: inherit; }
      .statistics { padding: 12px; margin-bottom: 16px; border-radius: var(--el-tile-radius); background: var(--el-surface); }
      .statistics h3 { margin: 0 0 12px; }
      .stats-grid > div { flex: 1 1 100px; }
      .stats-grid strong { font-size: 1.3em; }
      .stats-grid span { font-size: 0.85em; color: var(--el-muted); }
      .count {
        margin-left: auto;
        font-size: 0.85em;
      }
      .grid {
        display: grid;
        gap: 16px var(--el-gap);
        grid-template-columns: repeat(
          auto-fill,
          minmax(min(var(--el-poster-width, 150px), 100%), 1fr)
        );
      }
      .skeleton.poster {
        aspect-ratio: 2 / 3;
      }
      .skeleton.line {
        height: 0.9em;
        margin: 8px 0 1.4em;
        width: 70%;
      }
      .sentinel {
        height: 1px;
      }
      .more {
        padding: 16px;
        text-align: center;
      }
    `
];
v([
  _({ attribute: !1 })
], f.prototype, "api", 2);
v([
  _()
], f.prototype, "language", 2);
v([
  _({ attribute: !1 })
], f.prototype, "parent", 2);
v([
  _({ type: Number })
], f.prototype, "refreshKey", 2);
v([
  c()
], f.prototype, "_views", 2);
v([
  c()
], f.prototype, "_items", 2);
v([
  c()
], f.prototype, "_total", 2);
v([
  c()
], f.prototype, "_loading", 2);
v([
  c()
], f.prototype, "_error", 2);
v([
  c()
], f.prototype, "_sortBy", 2);
v([
  c()
], f.prototype, "_sortOrder", 2);
v([
  c()
], f.prototype, "_filter", 2);
v([
  c()
], f.prototype, "_genre", 2);
v([
  c()
], f.prototype, "_year", 2);
v([
  c()
], f.prototype, "_runtime", 2);
v([
  c()
], f.prototype, "_rating", 2);
v([
  c()
], f.prototype, "_statistics", 2);
v([
  c()
], f.prototype, "_statsError", 2);
v([
  c()
], f.prototype, "_randomBusy", 2);
v([
  c()
], f.prototype, "_randomEmpty", 2);
v([
  c()
], f.prototype, "_randomError", 2);
v([
  c()
], f.prototype, "_windowStart", 2);
v([
  c()
], f.prototype, "_spacer", 2);
v([
  Q(".grid")
], f.prototype, "_grid", 2);
v([
  Q(".sentinel.bottom")
], f.prototype, "_bottom", 2);
v([
  Q(".spacer")
], f.prototype, "_spacerElement", 2);
f = v([
  z("emby-library-library")
], f);
var Gi = Object.defineProperty, Yi = Object.getOwnPropertyDescriptor, j = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? Yi(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (r ? o(t, i, s) : o(s)) || s);
  return r && s && Gi(t, i, s), s;
};
const Ji = 300, Oe = 2;
let M = class extends C {
  constructor() {
    super(...arguments), this.language = "en", this.refreshKey = 0, this._term = "", this._results = null, this._searched = "", this._loading = !1, this._error = null, this._sequence = 0;
  }
  focusInput() {
    this.updateComplete.then(() => this._input?.focus());
  }
  disconnectedCallback() {
    super.disconnectedCallback(), clearTimeout(this._timer);
  }
  willUpdate(e) {
    e.has("api") && e.get("api") !== void 0 ? this._run() : e.has("refreshKey") && this._error !== null && this._run();
  }
  _onInput(e) {
    if (this._term = e.target.value, clearTimeout(this._timer), this._sequence += 1, this._term.trim().length < Oe) {
      this._results = null, this._loading = !1, this._error = null;
      return;
    }
    this._loading = !0, this._timer = setTimeout(() => this._run(), Ji);
  }
  _run() {
    const e = this._term.trim();
    if (e.length < Oe) return;
    const t = ++this._sequence;
    this._loading = !0, this._error = null, this.api.search(e).then((i) => {
      t === this._sequence && (this._results = i, this._searched = e, this._loading = !1);
    }).catch((i) => {
      t === this._sequence && (this._error = A(i).code, this._loading = !1);
    });
  }
  _clear() {
    clearTimeout(this._timer), this._sequence += 1, this._term = "", this._results = null, this._loading = !1, this._error = null, this.focusInput();
  }
  render() {
    const e = (t, i) => b(this.language, t, i);
    return a`
      <div class="field" role="search">
        <ha-icon icon="mdi:magnify"></ha-icon>
        <input
          type="search"
          enterkeyhint="search"
          autocomplete="off"
          spellcheck="false"
          .value=${this._term}
          placeholder=${e("search.placeholder")}
          aria-label=${e("search.placeholder")}
          @input=${this._onInput}
        />
        ${this._term ? a`<button class="icon-button" aria-label=${e("search.clear")} @click=${this._clear}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>` : d}
      </div>
      <div aria-live="polite">${this._renderBody(e)}</div>
    `;
  }
  _renderBody(e) {
    if (this._error !== null) return V(this.language, this._error, () => this._run());
    if (this._term.trim().length < Oe)
      return ge(e("search.hint"), "mdi:magnify");
    if (this._results === null || this._loading && this._results.length === 0)
      return a`<div class="grid" aria-busy="true">
        ${Array.from(
        { length: 12 },
        () => a`<div aria-hidden="true">
            <div class="skeleton poster"></div>
            <div class="skeleton line"></div>
          </div>`
      )}
      </div>`;
    if (this._results.length === 0)
      return ge(e("search.empty", { term: this._searched }), "mdi:magnify-close");
    const t = ai(this._results);
    return a`
      ${this._renderGroup(e("search.movies"), t.movies, "poster")}
      ${this._renderGroup(e("search.series"), t.series, "poster")}
      ${this._renderGroup(e("search.episodes"), t.episodes, "still")}
    `;
  }
  _renderGroup(e, t, i) {
    return t.length === 0 ? d : a`
      <section aria-label=${e}>
        <h3>${e}</h3>
        <div class="grid ${i}" role="list">
          ${oe(
      t,
      (r) => r.id,
      (r) => a`<emby-library-poster
                role="listitem"
                .item=${r}
                .shape=${i}
                .language=${this.language}
              ></emby-library-poster>`
    )}
        </div>
      </section>
    `;
  }
};
M.styles = [
  F,
  D`
      :host {
        display: block;
        padding: 8px 16px 16px;
      }
      .field {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 48px;
        padding: 0 4px 0 14px;
        border-radius: 24px;
        background: var(--el-surface);
      }
      .field:focus-within {
        outline: 2px solid var(--el-accent);
      }
      input {
        flex: 1;
        min-width: 0;
        height: 44px;
        border: 0;
        background: transparent;
        color: var(--primary-text-color);
        font: inherit;
        outline: none;
      }
      input::-webkit-search-cancel-button {
        display: none;
      }
      h3 {
        margin: 16px 0 8px;
        font-size: 1.05em;
        font-weight: 500;
      }
      .grid {
        display: grid;
        gap: 16px var(--el-gap);
        margin-top: 12px;
        grid-template-columns: repeat(
          auto-fill,
          minmax(min(var(--el-poster-width, 150px), 100%), 1fr)
        );
      }
      section .grid {
        margin-top: 0;
      }
      .grid.still {
        grid-template-columns: repeat(
          auto-fill,
          minmax(min(calc(var(--el-poster-width, 150px) * 1.5), 100%), 1fr)
        );
      }
      .skeleton.poster {
        aspect-ratio: 2 / 3;
      }
      .skeleton.line {
        height: 0.9em;
        margin: 8px 0 1.4em;
        width: 70%;
      }
    `
];
j([
  _({ attribute: !1 })
], M.prototype, "api", 2);
j([
  _()
], M.prototype, "language", 2);
j([
  _({ type: Number })
], M.prototype, "refreshKey", 2);
j([
  c()
], M.prototype, "_term", 2);
j([
  c()
], M.prototype, "_results", 2);
j([
  c()
], M.prototype, "_searched", 2);
j([
  c()
], M.prototype, "_loading", 2);
j([
  c()
], M.prototype, "_error", 2);
j([
  Q("input")
], M.prototype, "_input", 2);
M = j([
  z("emby-library-search")
], M);
var Zi = Object.defineProperty, Xi = Object.getOwnPropertyDescriptor, E = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? Xi(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (r ? o(t, i, s) : o(s)) || s);
  return r && s && Zi(t, i, s), s;
};
const Qi = "0.4.0", es = 6e4, ts = 1e4, is = 6e3, ss = {
  home: "mdi:home-outline",
  library: "mdi:filmstrip-box-multiple",
  search: "mdi:magnify"
}, ht = {
  home: "nav.home",
  library: "nav.library",
  search: "nav.search"
}, rs = {
  play: "media_play",
  pause: "media_pause",
  stop: "media_stop",
  next: "media_next_track",
  previous: "media_previous_track"
};
let x = class extends C {
  constructor() {
    super(...arguments), this._lang = "en", this._entry = null, this._problem = null, this._tab = "home", this._stacks = { home: [], library: [], search: [] }, this._sessions = [], this._clients = [], this._receivedAt = 0, this._available = !0, this._refreshKey = 0, this._onLibraryChanged = () => {
      this._refreshKey += 1;
    }, this._picker = null, this._message = null, this._selectedDevice = null, this._volumes = {}, this._volumesKey = "{}", this._controls = {}, this._controlsKey = "{}", this._generation = 0, this._nextKey = 1, this._waiters = /* @__PURE__ */ new Set(), this._scroll = /* @__PURE__ */ new Map(), this._onReady = () => {
      this._problem !== null || this._api === void 0 ? this._init() : this._refreshKey += 1;
    }, this._onPlay = (e) => {
      e.stopPropagation(), this._requestPlay(e.detail);
    }, this._onControl = (e) => {
      e.stopPropagation();
      const { sessionId: t, command: i, value: r } = e.detail;
      this._visibleSessions.some((s) => s.session_id === t) && this._api?.control(t, i, r).catch((s) => {
        this._show(ve(this._lang, A(s).code));
      });
    }, this._onVolume = (e) => {
      e.stopPropagation();
      const t = this._hass, { entityId: i, level: r, muted: s } = e.detail, n = this._targets.some((l) => l.volume_entity === i);
      if (!t || !n) return;
      (r !== void 0 ? t.callService(
        "media_player",
        "volume_set",
        { volume_level: Math.min(100, Math.max(0, r)) / 100 },
        { entity_id: i }
      ) : t.callService(
        "media_player",
        "volume_mute",
        { is_volume_muted: s === !0 },
        { entity_id: i }
      )).catch(() => this._show(this._t("error.generic")));
    }, this._onMedia = (e) => {
      e.stopPropagation();
      const t = this._hass, { entityId: i, command: r } = e.detail, s = rs[r], n = this._targets.some((o) => o.control_entity === i);
      !t || !n || !s || t.callService("media_player", s, {}, { entity_id: i }).catch(() => this._show(this._t("error.generic")));
    }, this._onOpenItem = (e) => {
      e.stopPropagation();
      const { id: t, type: i, name: r } = e.detail.item, s = this._nextKey++;
      i === "BoxSet" || i === "Folder" ? this._push({ key: s, kind: "items", id: t, name: r }) : this._push({ key: s, kind: "detail", id: t, name: r });
    }, this._onViewError = (e) => {
      e.stopPropagation(), e.detail.code === "not_found" && (this._back(), this._show(this._t("error.not_found")));
    };
  }
  static getConfigElement() {
    return document.createElement("emby-library-card-editor");
  }
  static getStubConfig() {
    return {};
  }
  // --- Lovelace API -------------------------------------------------------
  setConfig(e) {
    const t = this._config, i = re(e);
    this._config = i, (t === void 0 || t.start_view !== i.start_view) && this._showTab(i.start_view), !i.show_search && this._tab === "search" && this._showTab("home"), t !== void 0 && t.entry !== i.entry && this._init(), this._updateVolumes();
  }
  /** Re-render only when a configured volume_entity or control_entity changes. */
  _updateVolumes() {
    const e = this._targets;
    if (e.length === 0 && this._volumesKey === "{}" && this._controlsKey === "{}") return;
    const t = ci(e, this._hass?.states), i = JSON.stringify(t);
    i !== this._volumesKey && (this._volumesKey = i, this._volumes = t);
    const r = _i(e, this._hass?.states), s = JSON.stringify(r);
    s !== this._controlsKey && (this._controlsKey = s, this._controls = r);
  }
  set hass(e) {
    const t = this._hass;
    this._hass = e;
    const i = mt(e);
    i !== this._lang && (this._lang = i), this._updateVolumes(), t?.connection !== e.connection && (t?.connection.removeEventListener("ready", this._onReady), this.isConnected && (e.connection.addEventListener("ready", this._onReady), this._init()));
  }
  get hass() {
    return this._hass;
  }
  getCardSize() {
    const e = this._config?.height;
    return typeof e == "number" ? Math.max(1, Math.round(e / 50)) : 8;
  }
  getGridOptions() {
    return { columns: 12, min_columns: 6, min_rows: 4 };
  }
  // --- Lifecycle ----------------------------------------------------------
  connectedCallback() {
    super.connectedCallback(), this.addEventListener("emby-open-item", this._onOpenItem), this.addEventListener("emby-play", this._onPlay), this.addEventListener("emby-control", this._onControl), this.addEventListener("emby-volume", this._onVolume), this.addEventListener("emby-media", this._onMedia), this.addEventListener("emby-error", this._onViewError), this.addEventListener("emby-library-changed", this._onLibraryChanged), this._hass && (this._hass.connection.addEventListener("ready", this._onReady), this._init());
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.removeEventListener("emby-open-item", this._onOpenItem), this.removeEventListener("emby-play", this._onPlay), this.removeEventListener("emby-control", this._onControl), this.removeEventListener("emby-volume", this._onVolume), this.removeEventListener("emby-media", this._onMedia), this.removeEventListener("emby-error", this._onViewError), this.removeEventListener("emby-library-changed", this._onLibraryChanged), this._hass?.connection.removeEventListener("ready", this._onReady), this._generation += 1, this._stopSessions(), clearTimeout(this._messageTimer), clearTimeout(this._refreshTimer), this._waiters.clear();
  }
  _stopSessions() {
    this._unsubscribe?.(), this._unsubscribe = void 0;
  }
  /** Resolve the config entry and subscribe to its sessions. */
  async _init() {
    const e = this._hass, t = this._config;
    if (!e || !t || !this.isConnected) return;
    const i = ++this._generation;
    this._stopSessions();
    let r;
    try {
      r = await new we(e).entries();
    } catch {
      r = [];
    }
    if (i !== this._generation) return;
    let s, n = null;
    if (r.length === 0 ? n = "no_entry" : t.entry !== void 0 ? (s = r.find((h) => h.entry_id === t.entry), s || (n = "entry_not_found")) : r.length === 1 ? s = r[0] : n = "entry_required", this._problem = n, !s) {
      this._entry = null, this._api = void 0;
      return;
    }
    const o = this._entry?.entry_id !== s.entry_id;
    this._entry = s;
    const l = new we(e, s.entry_id);
    this._api = l, this._selectedDevice = this._readStoredDevice(s.entry_id), o && (this._stacks = { home: [], library: [], search: [] }, this._sessions = [], this._clients = [], this._showTab(this._tab));
    try {
      const h = await l.subscribeSessions((p) => this._onSessions(p));
      i !== this._generation ? h() : this._unsubscribe = h;
    } catch (h) {
      i === this._generation && (this._problem = A(h).code);
    }
  }
  // --- Sessions -----------------------------------------------------------
  _onSessions(e) {
    const t = this._available, i = this._sessions.some((r) => r.state !== "idle");
    this._sessions = e.sessions, this._clients = e.clients ?? [], this._available = e.available, this._receivedAt = Date.now(), !t && e.available && (this._refreshKey += 1), i && !e.sessions.some((r) => r.state !== "idle") && (clearTimeout(this._refreshTimer), this._refreshTimer = setTimeout(() => this._refreshKey += 1, 1500));
    for (const r of [...this._waiters])
      r.check(e.sessions) && this._waiters.delete(r);
  }
  /** Wait until the session list satisfies `find`, or give up after `timeoutMs`. */
  _waitFor(e, t) {
    const i = e(this._sessions);
    return i !== null ? Promise.resolve(i) : new Promise((r) => {
      const s = {
        check: (o) => {
          const l = e(o);
          return l === null ? !1 : (clearTimeout(n), r(l), !0);
        }
      }, n = setTimeout(() => {
        this._waiters.delete(s), r(null);
      }, t);
      this._waiters.add(s);
    });
  }
  // --- Target and playback --------------------------------------------------
  _readStoredDevice(e) {
    try {
      return localStorage.getItem(st(e));
    } catch {
      return null;
    }
  }
  _storeDevice(e) {
    if (this._selectedDevice = e, !!this._entry)
      try {
        localStorage.setItem(st(this._entry.entry_id), e);
      } catch {
      }
  }
  get _device() {
    const e = this._config;
    return e ? oi(
      this._selectedDevice,
      e.default_target,
      this._visibleSessions,
      this._targets
    ) : null;
  }
  get _targets() {
    return rt(
      ni(this._clients, this._config?.targets ?? []),
      this._config?.allowed_targets ?? []
    );
  }
  get _visibleSessions() {
    return rt(this._sessions, this._config?.allowed_targets ?? []);
  }
  _allowsDevice(e) {
    return this._config?.allowed_targets.includes(e) ?? !1;
  }
  _deviceName(e) {
    if (e === null) return null;
    const t = this._targets.find((i) => i.device_id === e);
    return t ? t.name : this._sessions.find((i) => i.device_id === e)?.device_name ?? null;
  }
  async _requestPlay(e) {
    const t = this._device, i = nt(t, this._visibleSessions);
    if (i) return this._playOn(i, e);
    const r = this._config?.targets.find(
      (s) => s.device_id === t && s.wake_action !== void 0
    );
    if (r) return this._wakeAndPlay(r, e);
    this._picker = { pending: e };
  }
  async _playOn(e, t) {
    if (!this._allowsDevice(e.device_id)) return;
    const i = this._api;
    if (!i) return;
    const r = this._deviceName(e.device_id) ?? e.device_name;
    this._show(this._t("target.starting", { name: r }), !0);
    let s;
    try {
      s = await i.play(e.session_id, t.itemId, t.mode);
    } catch (o) {
      const l = A(o).code;
      this._show(ve(this._lang, l)), (l === "session_not_found" || l === "not_controllable") && (this._picker = { pending: t });
      return;
    }
    await this._waitFor(
      (o) => o.find(
        (l) => l.session_id === e.session_id && l.now_playing?.id === s
      ) ?? null,
      ts
    ) ? this._show(null) : this._show(this._t("target.not_started"));
  }
  async _wakeAndPlay(e, t) {
    if (!this._allowsDevice(e.device_id)) return;
    const i = this._hass, r = e.wake_action;
    if (!i || !r) return;
    this._show(this._t("target.waking", { name: e.name }), !0);
    const [s, n] = r.action.split(".", 2);
    try {
      await i.callService(s, n, r.data ?? {}, r.target);
    } catch {
      this._show(this._t("error.generic"));
      return;
    }
    const o = await this._waitFor(
      (l) => nt(e.device_id, l),
      es
    );
    if (!o) {
      this._show(this._t("target.no_response"));
      return;
    }
    await this._playOn(o, t);
  }
  _onTargetChosen(e) {
    const t = this._picker?.pending ?? null;
    this._picker = null;
    const i = e.detail;
    this._allowsDevice(i.kind === "session" ? i.session.device_id : i.target.device_id) && (i.kind === "session" ? (this._storeDevice(i.session.device_id), t && this._playOn(i.session, t)) : (this._storeDevice(i.target.device_id), t && this._wakeAndPlay(i.target, t)));
  }
  // --- Navigation -----------------------------------------------------------
  get _stack() {
    return this._stacks[this._tab];
  }
  _root(e) {
    const t = this._nextKey++;
    return e === "home" ? { key: t, kind: "home" } : e === "library" ? { key: t, kind: "views" } : { key: t, kind: "search" };
  }
  _showTab(e) {
    this._saveScroll(), this._stacks[e].length === 0 ? this._stacks = { ...this._stacks, [e]: [this._root(e)] } : e === this._tab && this._stacks[e].length > 1 && (this._stacks = { ...this._stacks, [e]: this._stacks[e].slice(0, 1) }), this._tab = e, this._restoreScroll();
  }
  _onTab(e) {
    this._showTab(e), e === "search" && this.updateComplete.then(
      () => this.renderRoot.querySelector("emby-library-search")?.focusInput()
    );
  }
  get _content() {
    return this.renderRoot?.querySelector(".content") ?? null;
  }
  _saveScroll() {
    const e = this._stack[this._stack.length - 1];
    e && this._scroll.set(e.key, {
      content: this._content?.scrollTop ?? 0,
      page: window.scrollY
    });
  }
  _restoreScroll() {
    this.updateComplete.then(() => {
      const e = this._stack[this._stack.length - 1], t = e ? this._scroll.get(e.key) : void 0, i = this._content;
      i && (i.scrollTop = t?.content ?? 0), t && this._config?.height === "auto" && window.scrollY !== t.page && window.scrollTo({ top: t.page });
    });
  }
  _push(e) {
    this._saveScroll(), this._stacks = { ...this._stacks, [this._tab]: [...this._stack, e] }, this.updateComplete.then(() => {
      const t = this._content;
      t && (t.scrollTop = 0), this.getBoundingClientRect().top < 0 && this.scrollIntoView({ block: "start" });
    });
  }
  _popTo(e) {
    const t = this._stack;
    if (!(e < 1 || e >= t.length)) {
      for (const i of t.slice(e)) this._scroll.delete(i.key);
      this._stacks = { ...this._stacks, [this._tab]: t.slice(0, e) }, this._restoreScroll();
    }
  }
  _back() {
    this._popTo(this._stack.length - 1);
  }
  // --- Messages ---------------------------------------------------------------
  _t(e, t) {
    return b(this._lang, e, t);
  }
  _show(e, t = !1) {
    clearTimeout(this._messageTimer), this._message = e, e !== null && !t && (this._messageTimer = setTimeout(() => this._message = null, is));
  }
  // --- Rendering ----------------------------------------------------------------
  render() {
    const e = this._config;
    if (!e) return d;
    const t = typeof e.height == "number", i = `--el-poster-width:${ot[e.poster_size]}px;${t ? `height:${e.height}px;` : ""}`;
    if (this._problem !== null)
      return a`<ha-card style=${i}>${this._renderProblem(this._problem)}</ha-card>`;
    const r = this._api;
    return r ? a`
      <ha-card class=${t ? "fixed" : "auto"} style=${i}>
        ${this._renderHeader(e)}
        ${this._available ? d : a`<div class="banner" role="status">
              <ha-icon icon="mdi:lan-disconnect"></ha-icon>${this._t("error.unreachable")}
            </div>`}
        <div class="content">
          ${Object.keys(this._stacks).map(
      (s) => oe(
        this._stacks[s],
        (n) => n.key,
        (n, o) => a`<div
                  class="level"
                  ?hidden=${s !== this._tab || o !== this._stacks[s].length - 1}
                >
                  ${this._renderLevel(n, r, e)}
                </div>`
      )
    )}
        </div>
        ${this._message !== null ? a`<div class="toast" role="status" aria-live="polite">${this._message}</div>` : d}
        ${e.show_now_playing ? a`<emby-library-now-playing
              class="now-playing"
              .language=${this._lang}
              .sessions=${this._visibleSessions}
              .volumes=${this._volumes}
              .controls=${this._controls}
              .receivedAt=${this._receivedAt}
            ></emby-library-now-playing>` : d}
        ${this._picker !== null ? a`<emby-library-target-picker
              .language=${this._lang}
              .sessions=${this._visibleSessions}
              .targets=${this._targets}
              .selectedDeviceId=${this._device}
              @emby-target-chosen=${this._onTargetChosen}
              @emby-close=${() => this._picker = null}
            ></emby-library-target-picker>` : d}
      </ha-card>
    ` : a`<ha-card style=${i} aria-busy="true">
        <div class="boot"><div class="skeleton"></div></div>
      </ha-card>`;
  }
  _renderHeader(e) {
    const t = e.show_search ? ["home", "library", "search"] : ["home", "library"], i = this._stack, r = this._deviceName(this._device);
    return a`
      <header>
        <nav class="tabs" aria-label=${this._t("nav.views")}>
          ${t.map(
      (s) => a`<button
                class="tab"
                aria-label=${this._t(ht[s])}
                aria-current=${s === this._tab ? "page" : "false"}
                @click=${() => this._onTab(s)}
              >
                <ha-icon icon=${ss[s]}></ha-icon>
                <span class="tab-label">${this._t(ht[s])}</span>
              </button>`
    )}
          <span class="flex"></span>
          <button
            class="icon-button ${r ? "has-target" : ""}"
            aria-label=${r ? this._t("target.current", { name: r }) : this._t("target.choose")}
            title=${r ?? this._t("target.choose")}
            @click=${() => this._picker = { pending: null }}
          >
            <ha-icon icon=${r ? "mdi:cast-connected" : "mdi:cast"}></ha-icon>
          </button>
        </nav>
        ${i.length > 1 ? a`<div class="crumbs">
              <button class="icon-button" aria-label=${this._t("nav.back")} @click=${this._back}>
                <ha-icon icon="mdi:arrow-left"></ha-icon>
              </button>
              <nav aria-label=${this._t("nav.breadcrumb")}>
                <ol>
                  ${i.map((s, n) => {
      const o = n === i.length - 1, l = this._levelName(s);
      return a`<li>
                      ${o ? a`<span aria-current="page">${l}</span>` : a`<button @click=${() => this._popTo(n + 1)}>${l}</button>
                            <ha-icon icon="mdi:chevron-right" aria-hidden="true"></ha-icon>`}
                    </li>`;
    })}
                </ol>
              </nav>
            </div>` : d}
      </header>
    `;
  }
  _levelName(e) {
    return e.kind === "home" ? this._t("nav.home") : e.kind === "views" ? this._t("nav.library") : e.kind === "search" ? this._t("nav.search") : e.name;
  }
  _renderLevel(e, t, i) {
    switch (e.kind) {
      case "home":
        return a`<emby-library-home
          .api=${t}
          .language=${this._lang}
          .shelves=${i.shelves}
          .limit=${i.shelf_limit}
          .posterWidth=${ot[i.poster_size]}
          .refreshKey=${this._refreshKey}
        ></emby-library-home>`;
      case "views":
        return a`<emby-library-library
          .api=${t}
          .language=${this._lang}
          .parent=${null}
          .refreshKey=${this._refreshKey}
        ></emby-library-library>`;
      case "items":
        return a`<emby-library-library
          .api=${t}
          .language=${this._lang}
          .parent=${e}
          .refreshKey=${this._refreshKey}
        ></emby-library-library>`;
      case "detail":
        return a`<emby-library-detail
          .api=${t}
          .language=${this._lang}
          .itemId=${e.id}
          .refreshKey=${this._refreshKey}
        ></emby-library-detail>`;
      case "search":
        return a`<emby-library-search
          .api=${t}
          .language=${this._lang}
          .refreshKey=${this._refreshKey}
        ></emby-library-search>`;
    }
  }
  _renderProblem(e) {
    return e === "no_entry" ? a`<div class="state" role="status">
        <ha-icon icon="mdi:movie-open-plus-outline"></ha-icon>
        <div>${this._t("error.no_entry")}</div>
        <a class="button" href="/config/integrations/dashboard/add?domain=emby_library"
          >${this._t("error.open_integrations")}</a
        >
      </div>` : a`<div class="state error" role="alert">
      <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
      <div>${ve(this._lang, e)}</div>
      ${e === "emby_unreachable" || e === "unknown" ? a`<button class="button" @click=${() => void this._init()}>
            <ha-icon icon="mdi:refresh"></ha-icon>${this._t("error.retry")}
          </button>` : d}
      ${e === "entry_required" || e === "entry_not_found" ? a`<a class="button" href="?edit=1">${this._t("error.edit_dashboard")}</a>` : d}
    </div>`;
  }
};
x.styles = [
  F,
  D`
      :host {
        display: block;
        container-type: inline-size;
      }
      ha-card {
        position: relative;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-height: 160px;
      }
      header {
        flex: none;
      }
      .tabs {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 8px 0 12px;
      }
      .tab {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: 44px;
        min-width: 44px;
        padding: 0 14px;
        border-radius: 22px;
        font-weight: 500;
        color: var(--el-muted);
      }
      .tab[aria-current="page"] {
        color: var(--primary-text-color);
        background: var(--el-surface);
      }
      .flex {
        flex: 1;
      }
      .has-target {
        color: var(--el-accent);
      }
      .crumbs {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 12px 0 8px;
        min-width: 0;
      }
      .crumbs nav {
        min-width: 0;
        overflow: hidden;
      }
      ol {
        display: flex;
        align-items: center;
        list-style: none;
        margin: 0;
        padding: 0;
        min-width: 0;
      }
      li {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-right: 4px;
        min-width: 0;
        color: var(--el-muted);
        --mdc-icon-size: 18px;
      }
      li:last-child {
        flex: 1;
        color: var(--primary-text-color);
        font-weight: 500;
      }
      li button,
      li span {
        min-height: 44px;
        display: inline-flex;
        align-items: center;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      li button {
        max-width: 22cqi;
        display: inline-block;
      }
      .banner {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 8px 12px 0;
        padding: 8px 12px;
        border-radius: var(--el-tile-radius);
        background: var(--el-surface);
        color: var(--error-color);
        --mdc-icon-size: 20px;
      }
      .content {
        flex: 1;
        min-height: 0;
      }
      ha-card.fixed .content {
        overflow-y: auto;
        overscroll-behavior: contain;
        scrollbar-width: thin;
      }
      .now-playing {
        flex: none;
        z-index: 2;
      }
      ha-card.auto .now-playing {
        position: sticky;
        bottom: 0;
      }
      ha-card.auto {
        overflow: visible;
      }
      .toast {
        position: sticky;
        bottom: 8px;
        z-index: 3;
        align-self: center;
        max-width: calc(100% - 24px);
        margin: 8px 12px;
        padding: 10px 16px;
        border-radius: 22px;
        background: var(--primary-text-color);
        color: var(--card-background-color, var(--primary-background-color));
        text-align: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }
      .boot {
        padding: 16px;
      }
      .boot .skeleton {
        height: 160px;
      }
      a.button {
        color: inherit;
        text-decoration: none;
      }
      @container (max-width: 420px) {
        .tab {
          padding: 0 12px;
        }
        .tab:not([aria-current="page"]) .tab-label {
          display: none;
        }
      }
    `
];
E([
  c()
], x.prototype, "_config", 2);
E([
  c()
], x.prototype, "_lang", 2);
E([
  c()
], x.prototype, "_api", 2);
E([
  c()
], x.prototype, "_entry", 2);
E([
  c()
], x.prototype, "_problem", 2);
E([
  c()
], x.prototype, "_tab", 2);
E([
  c()
], x.prototype, "_stacks", 2);
E([
  c()
], x.prototype, "_sessions", 2);
E([
  c()
], x.prototype, "_clients", 2);
E([
  c()
], x.prototype, "_receivedAt", 2);
E([
  c()
], x.prototype, "_available", 2);
E([
  c()
], x.prototype, "_refreshKey", 2);
E([
  c()
], x.prototype, "_picker", 2);
E([
  c()
], x.prototype, "_message", 2);
E([
  c()
], x.prototype, "_selectedDevice", 2);
E([
  c()
], x.prototype, "_volumes", 2);
E([
  c()
], x.prototype, "_controls", 2);
x = E([
  z("emby-library-card")
], x);
window.customCards = window.customCards ?? [];
window.customCards.some((e) => e.type === "emby-library-card") || window.customCards.push({
  type: "emby-library-card",
  name: "Emby Library",
  description: "Browse, search and play your Emby movies and series.",
  preview: !1
});
console.info(`%c EMBY-LIBRARY-CARD %c ${Qi} `, "font-weight:700", "");
export {
  Qi as CARD_VERSION,
  x as EmbyLibraryCard
};
