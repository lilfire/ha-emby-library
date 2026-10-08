/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ye = globalThis, Ie = ye.ShadowRoot && (ye.ShadyCSS === void 0 || ye.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Ne = Symbol(), Le = /* @__PURE__ */ new WeakMap();
let ct = class {
  constructor(t, i, r) {
    if (this._$cssResult$ = !0, r !== Ne) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = i;
  }
  get styleSheet() {
    let t = this.o;
    const i = this.t;
    if (Ie && t === void 0) {
      const r = i !== void 0 && i.length === 1;
      r && (t = Le.get(i)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), r && Le.set(i, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const bt = (e) => new ct(typeof e == "string" ? e : e + "", void 0, Ne), N = (e, ...t) => {
  const i = e.length === 1 ? e[0] : t.reduce((r, s, n) => r + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + e[n + 1], e[0]);
  return new ct(i, e, Ne);
}, wt = (e, t) => {
  if (Ie) e.adoptedStyleSheets = t.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
  else for (const i of t) {
    const r = document.createElement("style"), s = ye.litNonce;
    s !== void 0 && r.setAttribute("nonce", s), r.textContent = i.cssText, e.appendChild(r);
  }
}, Ue = Ie ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let i = "";
  for (const r of t.cssRules) i += r.cssText;
  return bt(i);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: $t, defineProperty: xt, getOwnPropertyDescriptor: kt, getOwnPropertyNames: St, getOwnPropertySymbols: Et, getPrototypeOf: At } = Object, xe = globalThis, He = xe.trustedTypes, Ct = He ? He.emptyScript : "", Pt = xe.reactiveElementPolyfillSupport, ce = (e, t) => e, be = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? Ct : null;
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
} }, De = (e, t) => !$t(e, t), Fe = { attribute: !0, type: String, converter: be, reflect: !1, useDefault: !1, hasChanged: De };
Symbol.metadata ??= Symbol("metadata"), xe.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let Z = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, i = Fe) {
    if (i.state && (i.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((i = Object.create(i)).wrapped = !0), this.elementProperties.set(t, i), !i.noAccessor) {
      const r = Symbol(), s = this.getPropertyDescriptor(t, r, i);
      s !== void 0 && xt(this.prototype, t, s);
    }
  }
  static getPropertyDescriptor(t, i, r) {
    const { get: s, set: n } = kt(this.prototype, t) ?? { get() {
      return this[i];
    }, set(o) {
      this[i] = o;
    } };
    return { get: s, set(o) {
      const a = s?.call(this);
      n?.call(this, o), this.requestUpdate(t, a, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? Fe;
  }
  static _$Ei() {
    if (this.hasOwnProperty(ce("elementProperties"))) return;
    const t = At(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(ce("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(ce("properties"))) {
      const i = this.properties, r = [...St(i), ...Et(i)];
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
      const a = o.fromAttribute(i, n.type);
      this[s] = a ?? this._$Ej?.get(s) ?? a, this._$Em = null;
    }
  }
  requestUpdate(t, i, r, s = !1, n) {
    if (t !== void 0) {
      const o = this.constructor;
      if (s === !1 && (n = this[t]), r ??= o.getPropertyOptions(t), !((r.hasChanged ?? De)(n, i) || r.useDefault && r.reflect && n === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, r)))) return;
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
        const { wrapped: o } = n, a = this[s];
        o !== !0 || this._$AL.has(s) || a === void 0 || this.C(s, void 0, n, a);
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
Z.elementStyles = [], Z.shadowRootOptions = { mode: "open" }, Z[ce("elementProperties")] = /* @__PURE__ */ new Map(), Z[ce("finalized")] = /* @__PURE__ */ new Map(), Pt?.({ ReactiveElement: Z }), (xe.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Re = globalThis, Ke = (e) => e, we = Re.trustedTypes, Ve = we ? we.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, ht = "$lit$", H = `lit$${Math.random().toFixed(9).slice(2)}$`, dt = "?" + H, Ot = `<${dt}>`, G = document, de = () => G.createComment(""), pe = (e) => e === null || typeof e != "object" && typeof e != "function", je = Array.isArray, Tt = (e) => je(e) || typeof e?.[Symbol.iterator] == "function", Se = `[ 	
\f\r]`, ae = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Be = /-->/g, qe = />/g, B = RegExp(`>|${Se}(?:([^\\s"'>=/]+)(${Se}*=${Se}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), We = /'/g, Ge = /"/g, pt = /^(?:script|style|textarea|title)$/i, Mt = (e) => (t, ...i) => ({ _$litType$: e, strings: t, values: i }), l = Mt(1), Y = Symbol.for("lit-noChange"), h = Symbol.for("lit-nothing"), Ye = /* @__PURE__ */ new WeakMap(), W = G.createTreeWalker(G, 129);
function ut(e, t) {
  if (!je(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Ve !== void 0 ? Ve.createHTML(t) : t;
}
const It = (e, t) => {
  const i = e.length - 1, r = [];
  let s, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = ae;
  for (let a = 0; a < i; a++) {
    const c = e[a];
    let p, f, u = -1, _ = 0;
    for (; _ < c.length && (o.lastIndex = _, f = o.exec(c), f !== null); ) _ = o.lastIndex, o === ae ? f[1] === "!--" ? o = Be : f[1] !== void 0 ? o = qe : f[2] !== void 0 ? (pt.test(f[2]) && (s = RegExp("</" + f[2], "g")), o = B) : f[3] !== void 0 && (o = B) : o === B ? f[0] === ">" ? (o = s ?? ae, u = -1) : f[1] === void 0 ? u = -2 : (u = o.lastIndex - f[2].length, p = f[1], o = f[3] === void 0 ? B : f[3] === '"' ? Ge : We) : o === Ge || o === We ? o = B : o === Be || o === qe ? o = ae : (o = B, s = void 0);
    const g = o === B && e[a + 1].startsWith("/>") ? " " : "";
    n += o === ae ? c + Ot : u >= 0 ? (r.push(p), c.slice(0, u) + ht + c.slice(u) + H + g) : c + H + (u === -2 ? a : g);
  }
  return [ut(e, n + (e[i] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
};
class ue {
  constructor({ strings: t, _$litType$: i }, r) {
    let s;
    this.parts = [];
    let n = 0, o = 0;
    const a = t.length - 1, c = this.parts, [p, f] = It(t, i);
    if (this.el = ue.createElement(p, r), W.currentNode = this.el.content, i === 2 || i === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (s = W.nextNode()) !== null && c.length < a; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const u of s.getAttributeNames()) if (u.endsWith(ht)) {
          const _ = f[o++], g = s.getAttribute(u).split(H), y = /([.?@])?(.*)/.exec(_);
          c.push({ type: 1, index: n, name: y[2], strings: g, ctor: y[1] === "." ? Dt : y[1] === "?" ? Rt : y[1] === "@" ? jt : ke }), s.removeAttribute(u);
        } else u.startsWith(H) && (c.push({ type: 6, index: n }), s.removeAttribute(u));
        if (pt.test(s.tagName)) {
          const u = s.textContent.split(H), _ = u.length - 1;
          if (_ > 0) {
            s.textContent = we ? we.emptyScript : "";
            for (let g = 0; g < _; g++) s.append(u[g], de()), W.nextNode(), c.push({ type: 2, index: ++n });
            s.append(u[_], de());
          }
        }
      } else if (s.nodeType === 8) if (s.data === dt) c.push({ type: 2, index: n });
      else {
        let u = -1;
        for (; (u = s.data.indexOf(H, u + 1)) !== -1; ) c.push({ type: 7, index: n }), u += H.length - 1;
      }
      n++;
    }
  }
  static createElement(t, i) {
    const r = G.createElement("template");
    return r.innerHTML = t, r;
  }
}
function ee(e, t, i = e, r) {
  if (t === Y) return t;
  let s = r !== void 0 ? i._$Co?.[r] : i._$Cl;
  const n = pe(t) ? void 0 : t._$litDirective$;
  return s?.constructor !== n && (s?._$AO?.(!1), n === void 0 ? s = void 0 : (s = new n(e), s._$AT(e, i, r)), r !== void 0 ? (i._$Co ??= [])[r] = s : i._$Cl = s), s !== void 0 && (t = ee(e, s._$AS(e, t.values), s, r)), t;
}
class Nt {
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
    const { el: { content: i }, parts: r } = this._$AD, s = (t?.creationScope ?? G).importNode(i, !0);
    W.currentNode = s;
    let n = W.nextNode(), o = 0, a = 0, c = r[0];
    for (; c !== void 0; ) {
      if (o === c.index) {
        let p;
        c.type === 2 ? p = new ie(n, n.nextSibling, this, t) : c.type === 1 ? p = new c.ctor(n, c.name, c.strings, this, t) : c.type === 6 && (p = new zt(n, this, t)), this._$AV.push(p), c = r[++a];
      }
      o !== c?.index && (n = W.nextNode(), o++);
    }
    return W.currentNode = G, s;
  }
  p(t) {
    let i = 0;
    for (const r of this._$AV) r !== void 0 && (r.strings !== void 0 ? (r._$AI(t, r, i), i += r.strings.length - 2) : r._$AI(t[i])), i++;
  }
}
class ie {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, i, r, s) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = t, this._$AB = i, this._$AM = r, this.options = s, this._$Cv = s?.isConnected ?? !0;
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
    t = ee(this, t, i), pe(t) ? t === h || t == null || t === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : t !== this._$AH && t !== Y && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Tt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== h && pe(this._$AH) ? this._$AA.nextSibling.data = t : this.T(G.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: i, _$litType$: r } = t, s = typeof r == "number" ? this._$AC(t) : (r.el === void 0 && (r.el = ue.createElement(ut(r.h, r.h[0]), this.options)), r);
    if (this._$AH?._$AD === s) this._$AH.p(i);
    else {
      const n = new Nt(s, this), o = n.u(this.options);
      n.p(i), this.T(o), this._$AH = n;
    }
  }
  _$AC(t) {
    let i = Ye.get(t.strings);
    return i === void 0 && Ye.set(t.strings, i = new ue(t)), i;
  }
  k(t) {
    je(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let r, s = 0;
    for (const n of t) s === i.length ? i.push(r = new ie(this.O(de()), this.O(de()), this, this.options)) : r = i[s], r._$AI(n), s++;
    s < i.length && (this._$AR(r && r._$AB.nextSibling, s), i.length = s);
  }
  _$AR(t = this._$AA.nextSibling, i) {
    for (this._$AP?.(!1, !0, i); t !== this._$AB; ) {
      const r = Ke(t).nextSibling;
      Ke(t).remove(), t = r;
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
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = t, this.name = i, this._$AM = s, this.options = n, r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String()), this.strings = r) : this._$AH = h;
  }
  _$AI(t, i = this, r, s) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) t = ee(this, t, i, 0), o = !pe(t) || t !== this._$AH && t !== Y, o && (this._$AH = t);
    else {
      const a = t;
      let c, p;
      for (t = n[0], c = 0; c < n.length - 1; c++) p = ee(this, a[r + c], i, c), p === Y && (p = this._$AH[c]), o ||= !pe(p) || p !== this._$AH[c], p === h ? t = h : t !== h && (t += (p ?? "") + n[c + 1]), this._$AH[c] = p;
    }
    o && !s && this.j(t);
  }
  j(t) {
    t === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Dt extends ke {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === h ? void 0 : t;
  }
}
class Rt extends ke {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== h);
  }
}
class jt extends ke {
  constructor(t, i, r, s, n) {
    super(t, i, r, s, n), this.type = 5;
  }
  _$AI(t, i = this) {
    if ((t = ee(this, t, i, 0) ?? h) === Y) return;
    const r = this._$AH, s = t === h && r !== h || t.capture !== r.capture || t.once !== r.once || t.passive !== r.passive, n = t !== h && (r === h || s);
    s && this.element.removeEventListener(this.name, this, r), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class zt {
  constructor(t, i, r) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    ee(this, t);
  }
}
const Lt = { I: ie }, Ut = Re.litHtmlPolyfillSupport;
Ut?.(ue, ie), (Re.litHtmlVersions ??= []).push("3.3.3");
const Ht = (e, t, i) => {
  const r = i?.renderBefore ?? t;
  let s = r._$litPart$;
  if (s === void 0) {
    const n = i?.renderBefore ?? null;
    r._$litPart$ = s = new ie(t.insertBefore(de(), n), n, void 0, i ?? {});
  }
  return s._$AI(e), s;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ze = globalThis;
let E = class extends Z {
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
    return Y;
  }
};
E._$litElement$ = !0, E.finalized = !0, ze.litElementHydrateSupport?.({ LitElement: E });
const Ft = ze.litElementPolyfillSupport;
Ft?.({ LitElement: E });
(ze.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const R = (e) => (t, i) => {
  i !== void 0 ? i.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Kt = { attribute: !0, type: String, converter: be, reflect: !1, hasChanged: De }, Vt = (e = Kt, t, i) => {
  const { kind: r, metadata: s } = i;
  let n = globalThis.litPropertyMetadata.get(s);
  if (n === void 0 && globalThis.litPropertyMetadata.set(s, n = /* @__PURE__ */ new Map()), r === "setter" && ((e = Object.create(e)).wrapped = !0), n.set(i.name, e), r === "accessor") {
    const { name: o } = i;
    return { set(a) {
      const c = t.get.call(this);
      t.set.call(this, a), this.requestUpdate(o, c, e, !0, a);
    }, init(a) {
      return a !== void 0 && this.C(o, void 0, e, a), a;
    } };
  }
  if (r === "setter") {
    const { name: o } = i;
    return function(a) {
      const c = this[o];
      t.call(this, a), this.requestUpdate(o, c, e, !0, a);
    };
  }
  throw Error("Unsupported decorator location: " + r);
};
function m(e) {
  return (t, i) => typeof i == "object" ? Vt(e, t, i) : ((r, s, n) => {
    const o = s.hasOwnProperty(n);
    return s.constructor.createProperty(n, r), o ? Object.getOwnPropertyDescriptor(s, n) : void 0;
  })(e, t, i);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function d(e) {
  return m({ ...e, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Bt = (e, t, i) => (i.configurable = !0, i.enumerable = !0, Reflect.decorate && typeof t != "object" && Object.defineProperty(e, t, i), i);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function se(e, t) {
  return (i, r, s) => {
    const n = (o) => o.renderRoot?.querySelector(e) ?? null;
    return Bt(i, r, { get() {
      return n(this);
    } });
  };
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const qt = { CHILD: 2 }, Wt = (e) => (...t) => ({ _$litDirective$: e, values: t });
let Gt = class {
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
const { I: Yt } = Lt, Je = (e) => e, Ze = () => document.createComment(""), le = (e, t, i) => {
  const r = e._$AA.parentNode, s = t === void 0 ? e._$AB : t._$AA;
  if (i === void 0) {
    const n = r.insertBefore(Ze(), s), o = r.insertBefore(Ze(), s);
    i = new Yt(n, o, e, e.options);
  } else {
    const n = i._$AB.nextSibling, o = i._$AM, a = o !== e;
    if (a) {
      let c;
      i._$AQ?.(e), i._$AM = e, i._$AP !== void 0 && (c = e._$AU) !== o._$AU && i._$AP(c);
    }
    if (n !== s || a) {
      let c = i._$AA;
      for (; c !== n; ) {
        const p = Je(c).nextSibling;
        Je(r).insertBefore(c, s), c = p;
      }
    }
  }
  return i;
}, q = (e, t, i = e) => (e._$AI(t, i), e), Jt = {}, Zt = (e, t = Jt) => e._$AH = t, Xt = (e) => e._$AH, Ee = (e) => {
  e._$AR(), e._$AA.remove();
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Xe = (e, t, i) => {
  const r = /* @__PURE__ */ new Map();
  for (let s = t; s <= i; s++) r.set(e[s], s);
  return r;
}, re = Wt(class extends Gt {
  constructor(e) {
    if (super(e), e.type !== qt.CHILD) throw Error("repeat() can only be used in text expressions");
  }
  dt(e, t, i) {
    let r;
    i === void 0 ? i = t : t !== void 0 && (r = t);
    const s = [], n = [];
    let o = 0;
    for (const a of e) s[o] = r ? r(a, o) : o, n[o] = i(a, o), o++;
    return { values: n, keys: s };
  }
  render(e, t, i) {
    return this.dt(e, t, i).values;
  }
  update(e, [t, i, r]) {
    const s = Xt(e), { values: n, keys: o } = this.dt(t, i, r);
    if (!Array.isArray(s)) return this.ut = o, n;
    const a = this.ut ??= [], c = [];
    let p, f, u = 0, _ = s.length - 1, g = 0, y = n.length - 1;
    for (; u <= _ && g <= y; ) if (s[u] === null) u++;
    else if (s[_] === null) _--;
    else if (a[u] === o[g]) c[g] = q(s[u], n[g]), u++, g++;
    else if (a[_] === o[y]) c[y] = q(s[_], n[y]), _--, y--;
    else if (a[u] === o[y]) c[y] = q(s[u], n[y]), le(e, c[y + 1], s[u]), u++, y--;
    else if (a[_] === o[g]) c[g] = q(s[_], n[g]), le(e, s[u], s[_]), _--, g++;
    else if (p === void 0 && (p = Xe(o, g, y), f = Xe(a, u, _)), p.has(a[u])) if (p.has(a[_])) {
      const O = f.get(o[g]), k = O !== void 0 ? s[O] : null;
      if (k === null) {
        const fe = le(e, s[u]);
        q(fe, n[g]), c[g] = fe;
      } else c[g] = q(k, n[g]), le(e, s[u], k), s[O] = null;
      g++;
    } else Ee(s[_]), _--;
    else Ee(s[u]), u++;
    for (; g <= y; ) {
      const O = le(e, c[y + 1]);
      q(O, n[g]), c[g++] = O;
    }
    for (; u <= _; ) {
      const O = s[u++];
      O !== null && Ee(O);
    }
    return this.ut = o, Zt(e, c), Y;
  }
}), Qt = [
  "entry_required",
  "entry_not_found",
  "emby_unreachable",
  "emby_auth_failed",
  "not_found",
  "session_not_found",
  "not_controllable",
  "unsupported_command"
];
class Qe extends Error {
  constructor(t, i) {
    super(i), this.name = "EmbyApiError", this.code = t;
  }
}
function M(e) {
  if (e instanceof Qe) return e;
  const t = e ?? {}, i = Qt.find((r) => r === t.code) ?? "unknown";
  return new Qe(i, typeof t.message == "string" ? t.message : String(e));
}
class $e {
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
      throw M(s);
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
      throw M(r);
    }
  }
}
function T(e, t, i) {
  e.dispatchEvent(new CustomEvent(t, { detail: i, bubbles: !0, composed: !0 }));
}
const Te = {
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
  "editor.poster_size": "Poster size",
  "editor.size.small": "Small",
  "editor.size.medium": "Medium",
  "editor.size.large": "Large",
  "editor.height": "Height in pixels (0 = automatic)",
  "editor.default_target": "Default player",
  "editor.all_clients": "Show all clients",
  "editor.allowed_targets": "Clients available in this card",
  "editor.targets_hint": "Add the players you want to use in this card. Choose a player from the list and give it a name. Volume and playback controls are optional. Removing the last player shows all discovered players again.",
  "editor.targets": "Client settings",
  "editor.new_target": "New client",
  "editor.add_target": "Add client",
  "editor.remove_target": "Remove client",
  "editor.target_error": "Changes have not been saved. Choose a player and enter a name for each player you add.",
  "editor.target.name": "Name",
  "editor.target.device_id": "Emby client (device ID)",
  "editor.target.volume_entity": "Media player for volume",
  "editor.target.control_entity": "Media player for playback control"
}, et = {
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
  "editor.poster_size": "Plakatstørrelse",
  "editor.size.small": "Liten",
  "editor.size.medium": "Middels",
  "editor.size.large": "Stor",
  "editor.height": "Høyde i piksler (0 = automatisk)",
  "editor.default_target": "Standardspiller",
  "editor.all_clients": "Vis alle klienter",
  "editor.allowed_targets": "Klienter tilgjengelig i dette kortet",
  "editor.targets_hint": "Legg til spillerne du vil bruke i kortet. Velg en spiller fra listen og gi den et navn. Volum og avspillingskontroll er valgfritt. Fjerner du den siste spilleren, vises alle oppdagede spillere igjen.",
  "editor.targets": "Klientinnstillinger",
  "editor.new_target": "Ny klient",
  "editor.add_target": "Legg til klient",
  "editor.remove_target": "Fjern klient",
  "editor.target_error": "Endringene er ikke lagret. Velg en spiller og oppgi et navn for hver spiller du legger til.",
  "editor.target.name": "Navn",
  "editor.target.device_id": "Emby-klient (enhets-ID)",
  "editor.target.volume_entity": "Mediespiller for volum",
  "editor.target.control_entity": "Mediespiller for avspillingskontroll"
}, tt = { en: Te, nb: et, no: et };
function _t(e) {
  return e?.locale?.language ?? e?.language ?? "en";
}
function A(e, t, i = {}) {
  const r = e.toLowerCase();
  let n = (tt[r] ?? tt[r.split("-")[0] ?? ""] ?? Te)[t] ?? Te[t] ?? t;
  for (const [o, a] of Object.entries(i))
    n = n.replaceAll(`{${o}}`, String(a));
  return n;
}
const L = N`
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
function ei(e, t) {
  const { poster: i, still: r, backdrop: s } = e.images;
  return t === "poster" ? i ?? null : r ?? s ?? null;
}
function it(e, t = "h", i = "min") {
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
function mt(e) {
  return e.season_number === null || e.episode_number === null ? "" : `S${e.season_number}E${e.episode_number}`;
}
function Me(e) {
  const t = mt(e);
  return t ? `${t} · ${e.name}` : e.name;
}
function ti(e) {
  return e.type === "Episode" ? e.series_name ? { title: e.series_name, subtitle: Me(e) } : { title: Me(e), subtitle: "" } : { title: e.name, subtitle: e.year !== null ? String(e.year) : "" };
}
function ii(e, t) {
  const i = e.position_s ?? 0;
  if (e.state !== "playing") return i;
  const r = i + Math.max(0, t) / 1e3;
  return e.duration_s !== null ? Math.min(r, e.duration_s) : r;
}
function si(e, t) {
  return e === null || t === null || t <= 0 ? 0 : Math.min(1, Math.max(0, e / t));
}
const st = (e) => `emby-library-card:target:${e}`;
function ri(e, t) {
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
function ni(e, t, i, r) {
  const s = i.filter((a) => a.controllable), n = (a) => a !== null && (s.some((c) => c.device_id === a) || r.some((c) => c.device_id === a));
  return n(e) ? e : n(t) ? t : new Set(s.map((a) => a.device_id)).size === 1 && s.length === 1 ? s[0].device_id : null;
}
function nt(e, t) {
  return e === null ? null : t.find((i) => i.controllable && i.device_id === e) ?? null;
}
function oi(e) {
  return {
    movies: e.filter((t) => t.type === "Movie" || t.type === "Video"),
    series: e.filter((t) => t.type === "Series"),
    episodes: e.filter((t) => t.type === "Episode")
  };
}
function ai(e, t, i, r) {
  const s = Math.max(1, r);
  if (t - e <= i) return e;
  const n = t - e - i;
  return e + Math.ceil(n / s) * s;
}
const li = 4, ci = 8;
function hi(e, t) {
  const i = {};
  for (const r of e) {
    const s = r.volume_entity, n = s ? t?.[s] : void 0;
    if (!s || !n || n.state === "unavailable" || n.state === "unknown")
      continue;
    const o = Number(n.attributes.supported_features) || 0, a = n.attributes.volume_level, c = (o & li) !== 0, p = (o & ci) !== 0;
    !c && !p || (i[r.device_id] = {
      entityId: s,
      level: typeof a == "number" && Number.isFinite(a) ? Math.round(Math.min(1, Math.max(0, a)) * 100) : null,
      muted: n.attributes.is_volume_muted === !0,
      canSet: c,
      canMute: p
    });
  }
  return i;
}
const di = [
  ["pause", 1],
  ["previous", 16],
  ["next", 32],
  ["stop", 4096],
  ["play", 16384]
];
function pi(e) {
  const t = [e.attributes.app_id, e.attributes.app_name].filter(
    (i) => typeof i == "string" && i !== ""
  );
  return t.length === 0 || t.some((i) => /emby/i.test(i));
}
function ui(e, t) {
  const i = {};
  for (const r of e) {
    const s = r.control_entity, n = s ? t?.[s] : void 0;
    if (!s || !n || n.state === "unavailable" || n.state === "unknown")
      continue;
    const o = Number(n.attributes.supported_features) || 0, a = di.filter(([, c]) => (o & c) !== 0).map(
      ([c]) => c
    );
    a.length !== 0 && (i[r.device_id] = { entityId: s, commands: pi(n) ? a : [] });
  }
  return i;
}
var _i = Object.defineProperty, mi = Object.getOwnPropertyDescriptor, U = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? mi(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (r ? o(t, i, s) : o(s)) || s);
  return r && s && _i(t, i, s), s;
};
let I = class extends E {
  constructor() {
    super(...arguments), this.language = "en", this.sessions = [], this.volumes = {}, this.controls = {}, this.receivedAt = 0, this._now = Date.now(), this._expanded = null, this._dragging = null;
  }
  _t(e, t) {
    return A(this.language, e, t);
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
    T(this, "emby-control", { sessionId: e.session_id, command: t, value: i });
  }
  _toggle(e) {
    this._expanded = this._expanded === e.session_id ? null : e.session_id;
  }
  render() {
    const e = this.sessions.filter(
      (t) => t.state !== "idle" && t.now_playing !== null
    );
    return e.length === 0 ? h : l`
      <section aria-label=${this._t("np.title")}>
        ${re(
      e,
      (t) => t.session_id,
      (t) => this._renderSession(t)
    )}
      </section>
    `;
  }
  _renderSession(e) {
    const t = e.now_playing, i = this.controls[e.device_id], r = (_) => (i ? i.commands : e.supported_commands).includes(_), s = (_) => {
      i ? T(this, "emby-media", { entityId: i.entityId, command: _ }) : this._send(e, _);
    }, n = this._expanded === e.session_id, o = ii(e, this._now - this.receivedAt), a = t.images.still ?? t.images.poster, c = t.type === "Episode" && t.series_name ? t.series_name : t.name, p = t.type === "Episode" ? Me(t) : "", f = e.state === "playing", u = f ? r("pause") ? "pause" : r("play_pause") ? "play_pause" : null : r("play") ? "play" : r("play_pause") ? "play_pause" : null;
    return l`
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
              ${a ? l`<img
                    src=${a}
                    alt=${t.name}
                    decoding="async"
                    @error=${(_) => _.target.remove()}
                  />` : l`<ha-icon icon="mdi:play-box-outline"></ha-icon>`}
            </span>
            <span class="text">
              <span class="title">${c}</span>
              <span class="muted small">
                ${p ? l`${p} · ` : h}${e.device_name}
              </span>
            </span>
          </button>
          <div class="buttons">
            ${r("previous") ? this._button("mdi:skip-previous", "np.previous", () => s("previous")) : h}
            ${u ? this._button(
      f ? "mdi:pause" : "mdi:play",
      f ? "np.pause" : "np.play",
      () => s(u)
    ) : h}
            ${r("next") ? this._button("mdi:skip-next", "np.next", () => s("next")) : h}
            ${r("stop") ? this._button("mdi:stop", "np.stop", () => s("stop")) : h}
          </div>
        </div>
        <div class="bar" aria-hidden="true">
          <div style="width:${(si(o, e.duration_s) * 100).toFixed(2)}%"></div>
        </div>
        ${n ? this._renderControls(e, o) : h}
      </div>
    `;
  }
  _button(e, t, i) {
    return l`<button class="icon-button" aria-label=${this._t(t)} @click=${i}>
      <ha-icon icon=${e}></ha-icon>
    </button>`;
  }
  _renderControls(e, t) {
    const i = (k) => e.supported_commands.includes(k), r = `seek:${e.session_id}`, s = `volume:${e.session_id}`, n = (k, fe) => this._dragging?.key === k ? this._dragging.value : fe, o = e.duration_s ?? 0, a = n(r, t), c = e.can_seek && i("seek") && o > 0, p = this.volumes[e.device_id], f = p ? p.muted : e.muted, u = e.muted ? i("unmute") ? "unmute" : null : i("mute") ? "mute" : null, _ = p ? p.canMute : u !== null, g = p ? p.canSet : i("set_volume"), y = p ? p.level ?? 0 : e.volume ?? 100, O = () => {
      p ? T(this, "emby-volume", { entityId: p.entityId, muted: !f }) : u && this._send(e, u);
    };
    return l`
      <div class="controls">
        <div class="line">
          <span class="time">${Ae(a)}</span>
          ${c ? l`<input
                type="range"
                min="0"
                max=${o}
                step="1"
                .value=${String(Math.floor(a))}
                aria-label=${this._t("np.seek")}
                aria-valuetext=${Ae(a)}
                @input=${(k) => this._drag(r, k)}
                @change=${(k) => this._commit(e, "seek", k)}
              />` : l`<span class="flex"></span>`}
          ${o > 0 ? l`<span class="time">${Ae(o)}</span>` : h}
        </div>
        ${g || _ ? l`<div class="line">
              ${_ ? this._button(
      f ? "mdi:volume-off" : "mdi:volume-high",
      f ? "np.unmute" : "np.mute",
      O
    ) : l`<ha-icon class="pad" icon="mdi:volume-high"></ha-icon>`}
              ${g ? l`<input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    .value=${String(n(s, y))}
                    aria-label=${this._t("np.volume")}
                    @input=${(k) => this._drag(s, k)}
                    @change=${(k) => p ? this._commitExternal(p, k) : this._commit(e, "set_volume", k)}
                  />` : h}
            </div>` : h}
      </div>
    `;
  }
  _commitExternal(e, t) {
    const i = Number(t.target.value);
    T(this, "emby-volume", { entityId: e.entityId, level: i }), setTimeout(() => this._dragging = null, 2500);
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
  L,
  N`
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
  m()
], I.prototype, "language", 2);
U([
  m({ attribute: !1 })
], I.prototype, "sessions", 2);
U([
  m({ attribute: !1 })
], I.prototype, "volumes", 2);
U([
  m({ attribute: !1 })
], I.prototype, "controls", 2);
U([
  m({ type: Number })
], I.prototype, "receivedAt", 2);
U([
  d()
], I.prototype, "_now", 2);
U([
  d()
], I.prototype, "_expanded", 2);
U([
  d()
], I.prototype, "_dragging", 2);
I = U([
  R("emby-library-now-playing")
], I);
var gi = Object.defineProperty, fi = Object.getOwnPropertyDescriptor, ne = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? fi(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (r ? o(t, i, s) : o(s)) || s);
  return r && s && gi(t, i, s), s;
};
let F = class extends E {
  constructor() {
    super(...arguments), this.language = "en", this.sessions = [], this.targets = [], this.selectedDeviceId = null;
  }
  _t(e, t) {
    return A(this.language, e, t);
  }
  firstUpdated() {
    const e = this._dialog;
    e && !e.open && (typeof e.showModal == "function" ? e.showModal() : e.setAttribute("open", ""));
  }
  _close() {
    T(this, "emby-close");
  }
  _onCancel(e) {
    e.preventDefault(), this._close();
  }
  _onBackdrop(e) {
    e.target === this._dialog && this._close();
  }
  _choose(e) {
    T(this, "emby-target-chosen", e);
  }
  render() {
    const e = this.sessions.filter((s) => s.controllable), t = new Set(e.map((s) => s.device_id)), i = this.targets.filter((s) => !t.has(s.device_id)), r = new Map(this.targets.map((s) => [s.device_id, s.name]));
    return l`
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
          ${e.length === 0 && i.length === 0 ? l`<div class="state" role="status">
                  <ha-icon icon="mdi:television-off"></ha-icon>
                  <div>${this._t("target.none")}</div>
                </div>` : l`<ul>
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
    return l`
      <li>
        <button class="row" ?disabled=${s} aria-current=${r ? "true" : "false"} @click=${n}>
          <ha-icon icon=${i}></ha-icon>
          <span class="text">
            <span class="name">${e}</span>
            <span class="muted small">${t}</span>
          </span>
          ${r ? l`<ha-icon
                class="check"
                icon="mdi:check"
                role="img"
                aria-label=${this._t("target.selected")}
              ></ha-icon>` : h}
        </button>
      </li>
    `;
  }
};
F.styles = [
  L,
  N`
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
ne([
  m()
], F.prototype, "language", 2);
ne([
  m({ attribute: !1 })
], F.prototype, "sessions", 2);
ne([
  m({ attribute: !1 })
], F.prototype, "targets", 2);
ne([
  m({ attribute: !1 })
], F.prototype, "selectedDeviceId", 2);
ne([
  se("dialog")
], F.prototype, "_dialog", 2);
F = ne([
  R("emby-library-target-picker")
], F);
const X = ["resume", "next_up", "latest", "suggestions"], gt = ["home", "library", "search"], ft = ["small", "medium", "large"], yi = { small: 110, medium: 150, large: 190 }, Q = {
  start_view: "home",
  shelves: [...X],
  shelf_limit: 20,
  show_now_playing: !0,
  show_search: !0,
  poster_size: "medium",
  height: "auto",
  default_target: null,
  allowed_targets: null,
  targets: []
}, vi = ["type", "view_layout", "layout_options", "grid_options", "visibility"], bi = [...vi, "entry", ...Object.keys(Q)], he = (e) => typeof e == "object" && e !== null && !Array.isArray(e);
function Ce(e, t, i) {
  if (typeof t != "string" || !i.includes(t))
    throw new Error(`"${e}" must be one of: ${i.join(", ")}`);
  return t;
}
function ot(e, t) {
  if (typeof t != "boolean") throw new Error(`"${e}" must be true or false`);
  return t;
}
function wi(e, t) {
  if (!he(t)) throw new Error(`"${e}" must be an action`);
  const i = t.action ?? t.service;
  if (typeof i != "string" || !/^[a-z0-9_]+\.[a-z0-9_]+$/.test(i))
    throw new Error(`"${e}.action" must be an action such as script.turn_on`);
  const r = { action: i };
  if (t.target !== void 0) {
    if (!he(t.target)) throw new Error(`"${e}.target" must be a mapping`);
    r.target = t.target;
  }
  if (t.data !== void 0) {
    if (!he(t.data)) throw new Error(`"${e}.data" must be a mapping`);
    r.data = t.data;
  }
  return r;
}
function yt(e) {
  if (!Array.isArray(e)) throw new Error('"targets" must be a list');
  return e.map((t, i) => {
    const r = `targets[${i}]`;
    if (!he(t)) throw new Error(`"${r}" must be a mapping`);
    for (const n of Object.keys(t))
      if (!["name", "device_id", "wake_action", "volume_entity", "control_entity"].includes(n))
        throw new Error(`Unknown field "${r}.${n}"`);
    if (typeof t.name != "string" || !t.name)
      throw new Error(`"${r}.name" is required`);
    if (typeof t.device_id != "string" || !t.device_id)
      throw new Error(`"${r}.device_id" is required`);
    const s = { name: t.name, device_id: t.device_id };
    t.wake_action !== void 0 && (s.wake_action = wi(`${r}.wake_action`, t.wake_action));
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
function te(e) {
  if (!he(e)) throw new Error("Invalid configuration");
  for (const i of Object.keys(e))
    if (!bi.includes(i)) throw new Error(`Unknown field "${i}"`);
  const t = {
    type: typeof e.type == "string" ? e.type : "custom:emby-library-card",
    ...Q,
    shelves: [...Q.shelves],
    targets: []
  };
  if (e.entry !== void 0 && e.entry !== null && e.entry !== "") {
    if (typeof e.entry != "string") throw new Error('"entry" must be a config entry ID');
    t.entry = e.entry;
  }
  if (e.start_view !== void 0 && (t.start_view = Ce("start_view", e.start_view, gt)), e.shelves !== void 0) {
    if (!Array.isArray(e.shelves)) throw new Error('"shelves" must be a list');
    const i = e.shelves.map((r) => Ce("shelves", r, X));
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
  if (e.show_now_playing !== void 0 && (t.show_now_playing = ot("show_now_playing", e.show_now_playing)), e.show_search !== void 0 && (t.show_search = ot("show_search", e.show_search)), e.poster_size !== void 0 && (t.poster_size = Ce("poster_size", e.poster_size, ft)), e.height !== void 0 && e.height !== "auto") {
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
  if (e.targets !== void 0 && e.targets !== null && (t.targets = yt(e.targets)), e.allowed_targets !== void 0 && e.allowed_targets !== null) {
    if (!Array.isArray(e.allowed_targets) || e.allowed_targets.some(
      (i) => typeof i != "string" || !i.trim()
    ))
      throw new Error('"allowed_targets" must be a list of Emby device IDs');
    t.allowed_targets = [...new Set(e.allowed_targets)];
  } else e.allowed_targets === void 0 && t.targets.length && (t.allowed_targets = [...new Set(t.targets.map((i) => i.device_id))]);
  if (t.allowed_targets !== null && t.default_target !== null && !t.allowed_targets.includes(t.default_target) && (t.default_target = null), t.start_view === "search" && !t.show_search)
    throw new Error('"start_view: search" requires "show_search: true"');
  return t;
}
function $i(e) {
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
  return yt(e.map((t) => ({
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
  const i = te(e), r = xi(t), s = { ...e }, n = new Set(r.map((a) => a.device_id)), o = new Set(i.targets.filter((a) => !n.has(a.device_id)).map((a) => a.device_id));
  if (r.length ? s.targets = r : delete s.targets, Array.isArray(e.allowed_targets)) {
    const a = r.filter((p) => !i.targets.some((f) => f.device_id === p.device_id)), c = [.../* @__PURE__ */ new Set([
      ...(i.allowed_targets ?? []).filter((p) => !o.has(p)),
      ...a.map((p) => p.device_id)
    ])];
    !r.length && o.size && !c.length ? delete s.allowed_targets : s.allowed_targets = c;
  }
  return typeof s.default_target == "string" && o.has(s.default_target) && delete s.default_target, te(s).default_target === null && delete s.default_target, s;
}
const Si = 200;
function Ei(e, t) {
  const i = Number(e.height) || 0, r = e.shelves.filter((a) => X.includes(a)), s = r.length === X.length && r.every((a, c) => a === X[c]), n = {
    entry: e.entry || void 0,
    start_view: e.start_view === Q.start_view ? void 0 : e.start_view,
    shelves: s ? void 0 : r,
    shelf_limit: e.shelf_limit === Q.shelf_limit ? void 0 : e.shelf_limit,
    poster_size: e.poster_size === Q.poster_size ? void 0 : e.poster_size,
    height: i <= 0 ? void 0 : Math.max(Si, Math.round(i)),
    show_now_playing: e.show_now_playing ? void 0 : !1,
    show_search: e.show_search ? void 0 : !1,
    default_target: e.default_target || void 0,
    allowed_targets: e.all_clients ? Array.isArray(t.targets) && t.targets.length ? null : void 0 : e.allowed_targets
  }, o = Object.fromEntries(Object.entries(t).filter(([a]) => !(a in n)));
  for (const [a, c] of Object.entries(n))
    c !== void 0 && (o[a] = c);
  return o.show_search === !1 && o.start_view === "search" && delete o.start_view, te(o).default_target === null && delete o.default_target, o;
}
function at(e) {
  return {
    entry: e.entry,
    start_view: e.start_view,
    shelves: [...e.shelves],
    shelf_limit: e.shelf_limit,
    poster_size: e.poster_size,
    height: e.height === "auto" ? 0 : e.height,
    show_now_playing: e.show_now_playing,
    show_search: e.show_search,
    default_target: e.default_target ?? void 0,
    all_clients: e.allowed_targets === null,
    allowed_targets: [...e.allowed_targets ?? []]
  };
}
var Ai = Object.defineProperty, Ci = Object.getOwnPropertyDescriptor, j = (e, t, i, r) => {
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
let C = class extends E {
  constructor() {
    super(...arguments), this._raw = {}, this._entries = [], this._sessions = [], this._clients = [], this._lang = "en", this._targetForms = [], this._targetError = "", this._formReady = customElements.get("ha-form") !== void 0;
  }
  setConfig(e) {
    const t = te(e);
    (!this._config || JSON.stringify(t.targets) !== JSON.stringify(this._config.targets)) && (this._targetForms = t.targets.map($i), this._targetError = ""), this._config = t, this._raw = e, this._loadChoices();
  }
  set hass(e) {
    const t = this._hass === void 0;
    this._hass = e, this._lang = _t(e), t && this._loadChoices();
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
      this._entries = await new $e(e).entries();
    } catch {
      this._entries = [];
    }
    const r = t.entry ?? (this._entries.length === 1 ? this._entries[0].entry_id : null);
    if (r !== null)
      try {
        const s = { done: !1 };
        s.stop = await new $e(e, r).subscribeSessions((n) => {
          this._sessions = n.sessions, this._clients = n.clients ?? [], s.done = !0, s.stop?.();
        }), s.done ? s.stop() : setTimeout(() => s.stop?.(), 1e4);
      } catch {
        this._sessions = [];
      }
  }
  _t(e) {
    return A(this._lang, e);
  }
  _schema(e) {
    const t = (s, n) => ({ value: s, label: n }), i = /* @__PURE__ */ new Map();
    for (const s of this._clients)
      i.set(s.device_id, `${s.name} (${s.client})`);
    for (const s of e.targets) i.set(s.device_id, s.name);
    for (const s of this._sessions)
      s.controllable && !i.has(s.device_id) && i.set(s.device_id, `${s.device_name} (${s.client})`);
    for (const s of e.allowed_targets ?? [])
      i.has(s) || i.set(s, s);
    const r = [...i].filter(([s]) => e.allowed_targets === null || e.allowed_targets.includes(s));
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
            options: gt.map((s) => t(s, this._t(`nav.${s}`)))
          }
        }
      },
      {
        name: "shelves",
        selector: {
          select: {
            multiple: !0,
            reorder: !0,
            options: X.map((s) => t(s, this._t(`shelf.${s}`)))
          }
        }
      },
      { name: "shelf_limit", selector: { number: { min: 1, max: 50, step: 1, mode: "box" } } },
      {
        name: "poster_size",
        selector: {
          select: {
            mode: "dropdown",
            options: ft.map((s) => t(s, this._t(`editor.size.${s}`)))
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
      { name: "all_clients", selector: { boolean: {} } },
      ...e.allowed_targets === null ? [] : [{
        name: "allowed_targets",
        selector: { select: {
          multiple: !0,
          custom_value: !0,
          options: [...i].map(([s, n]) => t(s, n))
        } }
      }],
      ...e.allowed_targets !== null && r.length > 1 ? [{
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
    const t = Ei(e.detail.value, this._raw);
    this._emitConfig(t);
  }
  _emitConfig(e) {
    this._raw = e, this._config = te(e), this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config: e }, bubbles: !0, composed: !0 })
    );
  }
  _targetSchema() {
    const e = /* @__PURE__ */ new Map();
    for (const t of this._clients)
      e.set(t.device_id, `${t.name} (${t.client})`);
    for (const t of this._sessions)
      t.controllable && e.set(t.device_id, `${t.device_name} (${t.client})`);
    for (const t of this._targetForms)
      t.device_id && !e.has(t.device_id) && e.set(t.device_id, t.name || t.device_id);
    return [
      { name: "name", selector: { text: {} } },
      { name: "device_id", selector: { select: {
        mode: "dropdown",
        custom_value: !0,
        options: [...e].map(([t, i]) => ({ value: t, label: i }))
      } } },
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
  _removeTarget(e) {
    this._targetForms = this._targetForms.filter((t, i) => i !== e), this._saveTargets();
  }
  render() {
    const e = this._config;
    if (!this._hass || !e || !this._formReady) return h;
    const t = this._schema(e), i = t.filter((r) => r.name === "default_target");
    return l`
      <ha-form
        .hass=${this._hass}
        .data=${at(e)}
        .schema=${t.filter((r) => r.name !== "default_target")}
        .computeLabel=${(r) => this._t(`editor.${r.name}`)}
        @value-changed=${this._valueChanged}
      ></ha-form>
      <p>${this._t("editor.targets_hint")}</p>
      <h3>${this._t("editor.targets")}</h3>
      ${this._targetForms.map((r, s) => l`
        <section>
          <h4>${r.name || this._t("editor.new_target")}</h4>
          <ha-form
            .hass=${this._hass}
            .data=${r}
            .schema=${this._targetSchema()}
            .computeLabel=${(n) => this._t(`editor.target.${n.name}`)}
            @value-changed=${(n) => this._targetChanged(s, n)}
          ></ha-form>
          <button @click=${() => this._removeTarget(s)}>${this._t("editor.remove_target")}</button>
        </section>
      `)}
      ${this._targetError ? l`<p class="error" role="alert">${this._targetError}</p>` : h}
      <button @click=${() => {
      this._targetForms = [...this._targetForms, {}];
    }}>
        ${this._t("editor.add_target")}
      </button>
      ${i.length ? l`
        <ha-form
          .hass=${this._hass}
          .data=${at(e)}
          .schema=${i}
          .computeLabel=${(r) => this._t(`editor.${r.name}`)}
          @value-changed=${this._valueChanged}
        ></ha-form>
      ` : h}
    `;
  }
};
C.styles = N`
    section {
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 16px;
      margin: 12px 0;
    }
    h4 { margin: 0 0 16px; }
    button {
      margin-top: 16px;
      padding: 8px 16px;
      border: 1px solid var(--divider-color);
      border-radius: 20px;
      background: var(--card-background-color);
      color: var(--primary-color);
      font: inherit;
      cursor: pointer;
    }
    .error { color: var(--error-color); }
    p {
      margin: 16px 0 0;
      color: var(--secondary-text-color);
      font-size: 0.9em;
    }
  `;
j([
  d()
], C.prototype, "_raw", 2);
j([
  d()
], C.prototype, "_config", 2);
j([
  d()
], C.prototype, "_entries", 2);
j([
  d()
], C.prototype, "_sessions", 2);
j([
  d()
], C.prototype, "_clients", 2);
j([
  d()
], C.prototype, "_lang", 2);
j([
  d()
], C.prototype, "_targetForms", 2);
j([
  d()
], C.prototype, "_targetError", 2);
j([
  d()
], C.prototype, "_formReady", 2);
C = j([
  R("emby-library-card-editor")
], C);
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
  return A(e, Oi[t] ?? "error.generic");
}
function _e(e, t, i) {
  const r = i !== void 0 && (t === "emby_unreachable" || t === "unknown");
  return l`
    <div class="state error" role="alert">
      <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
      <div>${ve(e, t)}</div>
      ${r ? l`<button class="button" @click=${i}>
            <ha-icon icon="mdi:refresh"></ha-icon>${A(e, "error.retry")}
          </button>` : h}
    </div>
  `;
}
function me(e, t = "mdi:movie-open-outline") {
  return l`
    <div class="state" role="status">
      <ha-icon icon=${t}></ha-icon>
      <div>${e}</div>
    </div>
  `;
}
var Ti = Object.defineProperty, Mi = Object.getOwnPropertyDescriptor, oe = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? Mi(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (r ? o(t, i, s) : o(s)) || s);
  return r && s && Ti(t, i, s), s;
};
const Ii = {
  Movie: "mdi:movie-outline",
  Series: "mdi:television-classic",
  Season: "mdi:television-classic",
  Episode: "mdi:television-play",
  BoxSet: "mdi:filmstrip-box-multiple",
  Folder: "mdi:folder-outline",
  Video: "mdi:video-outline"
}, vt = (e) => Ii[e] ?? "mdi:video-outline";
let K = class extends E {
  constructor() {
    super(...arguments), this.shape = "poster", this.language = "en", this._failed = !1;
  }
  willUpdate(e) {
    (e.has("item") || e.has("shape")) && (this._failed = !1);
  }
  render() {
    const e = this.item, { title: t, subtitle: i } = this.caption ?? ti(e), r = this._failed ? null : ei(e, this.shape), s = e.progress > 0 && e.progress < 1, n = [t, i, e.played ? A(this.language, "detail.played") : ""].filter(Boolean).join(", ");
    return l`
      <button class="tile" aria-label=${n} @click=${this._open}>
        <div class="image ${this.shape}">
          ${r ? l`<img
                src=${r}
                alt=${e.name}
                loading="lazy"
                decoding="async"
                @error=${this._onError}
              />` : l`<div class="placeholder">
                <ha-icon icon=${vt(e.type)}></ha-icon>
                <span>${e.name}</span>
              </div>`}
          ${e.played ? l`<span class="badge" aria-hidden="true"
                ><ha-icon icon="mdi:check"></ha-icon
              ></span>` : e.unplayed_count ? l`<span class="badge count" aria-hidden="true">${e.unplayed_count}</span>` : h}
          ${s ? l`<div class="progress" aria-hidden="true">
                <div style="width:${Math.round(e.progress * 100)}%"></div>
              </div>` : h}
        </div>
        <div class="title">${t}</div>
        <div class="subtitle">${i || l`&nbsp;`}</div>
      </button>
    `;
  }
  _onError() {
    this._failed = !0;
  }
  _open() {
    T(this, "emby-open-item", { item: this.item });
  }
};
K.styles = [
  L,
  N`
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
oe([
  m({ attribute: !1 })
], K.prototype, "item", 2);
oe([
  m()
], K.prototype, "shape", 2);
oe([
  m()
], K.prototype, "language", 2);
oe([
  m({ attribute: !1 })
], K.prototype, "caption", 2);
oe([
  d()
], K.prototype, "_failed", 2);
K = oe([
  R("emby-library-poster")
], K);
var Ni = Object.defineProperty, Di = Object.getOwnPropertyDescriptor, S = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? Di(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (r ? o(t, i, s) : o(s)) || s);
  return r && s && Ni(t, i, s), s;
};
let x = class extends E {
  constructor() {
    super(...arguments), this.language = "en", this.itemId = "", this.refreshKey = 0, this._item = null, this._error = null, this._seasons = [], this._seasonId = null, this._episodes = null, this._expanded = !1, this._clamped = !1, this._posterFailed = !1, this._backdropFailed = !1, this._generation = 0;
  }
  _t(e, t) {
    return A(this.language, e, t);
  }
  willUpdate(e) {
    e.has("api") || e.has("itemId") ? (this._item = null, this._seasons = [], this._seasonId = null, this._episodes = null, this._expanded = !1, this._posterFailed = !1, this._backdropFailed = !1, this._load()) : e.has("refreshKey") && this._load();
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
      const i = M(t).code;
      i === "not_found" ? T(this, "emby-error", { code: i }) : this._error = i;
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
      t === this._generation && (this._error = M(i).code);
    }
  }
  _play(e) {
    this._item && T(this, "emby-play", { itemId: this._item.id, mode: e });
  }
  _open(e) {
    T(this, "emby-open-item", { item: e });
  }
  render() {
    if (this._error !== null)
      return _e(this.language, this._error, () => void this._load());
    const e = this._item;
    if (e === null) return this._renderSkeleton();
    const t = e.type === "Episode", i = this._backdropFailed ? null : e.images.backdrop ?? e.images.still, r = this._posterFailed ? null : t ? e.images.still ?? e.images.poster : e.images.poster, s = t ? mt(e) : "";
    return l`
      <div class="hero ${i ? "with-backdrop" : ""}">
        ${i ? l`<img
              class="backdrop"
              src=${i}
              alt=""
              decoding="async"
              @error=${() => this._backdropFailed = !0}
            />` : h}
        <div class="hero-content">
          <div class="poster ${t ? "still" : ""}">
            ${r ? l`<img
                  src=${r}
                  alt=${e.name}
                  decoding="async"
                  @error=${() => this._posterFailed = !0}
                />` : l`<div class="placeholder">
                  <ha-icon icon=${vt(e.type)}></ha-icon>
                </div>`}
            ${e.progress > 0 && e.progress < 1 ? l`<div class="progress" aria-hidden="true">
                  <div style="width:${Math.round(e.progress * 100)}%"></div>
                </div>` : h}
          </div>
          <div class="info">
            ${t && e.series_id && e.series_name ? l`<button
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
                </button>` : h}
            <h2>${s ? l`<span class="muted">${s} · </span>` : h}${e.name}</h2>
            ${this._renderMeta(e)}
            ${e.genres.length > 0 ? l`<div class="genres muted">${e.genres.slice(0, 4).join(" · ")}</div>` : h}
          </div>
        </div>
      </div>

      <div class="body">
        <div class="actions">${this._renderActions(e)}</div>
        ${e.overview ? l`
              <p class="overview ${this._expanded ? "expanded" : ""}">${e.overview}</p>
              ${this._clamped || this._expanded ? l`<button
                    class="more"
                    aria-expanded=${this._expanded ? "true" : "false"}
                    @click=${() => this._expanded = !this._expanded}
                  >
                    ${this._t(this._expanded ? "detail.show_less" : "detail.show_more")}
                  </button>` : h}
            ` : h}
        ${e.type === "Series" || e.type === "Season" ? this._renderEpisodes(e) : h}
      </div>
    `;
  }
  _renderMeta(e) {
    const t = [];
    e.year !== null && t.push(String(e.year));
    const i = it(e.runtime_s, this._t("time.h"), this._t("time.min"));
    if (i && t.push(i), e.type === "Series" && e.season_count && t.push(
      e.season_count === 1 ? this._t("detail.season_count_one") : this._t("detail.season_count", { count: e.season_count })
    ), e.official_rating && t.push(l`<span class="rating-box">${e.official_rating}</span>`), e.community_rating !== null) {
      const r = e.community_rating.toFixed(1);
      t.push(
        l`<span class="stars" aria-label=${this._t("detail.rating", { rating: r })}
          ><ha-icon icon="mdi:star"></ha-icon>${r}</span
        >`
      );
    }
    return e.played ? t.push(
      l`<span class="stars"
          ><ha-icon icon="mdi:check-circle"></ha-icon>${this._t("detail.played")}</span
        >`
    ) : e.unplayed_count && t.push(this._t("detail.unplayed_count", { count: e.unplayed_count })), l`<div class="meta">${t.map((r) => l`<span>${r}</span>`)}</div>`;
  }
  _renderActions(e) {
    return e.type === "Series" || e.type === "Season" ? l`<button class="button primary" @click=${() => this._play("resume")}>
        <ha-icon icon="mdi:play"></ha-icon>${this._t("detail.play")}
      </button>` : e.type === "BoxSet" || e.type === "Folder" ? h : e.position_s > 0 ? l`
        <button class="button primary" @click=${() => this._play("resume")}>
          <ha-icon icon="mdi:play"></ha-icon>${this._t("detail.resume")}
        </button>
        <button class="button" @click=${() => this._play("start")}>
          <ha-icon icon="mdi:restart"></ha-icon>${this._t("detail.play_from_start")}
        </button>
      ` : l`<button class="button primary" @click=${() => this._play("start")}>
      <ha-icon icon="mdi:play"></ha-icon>${this._t("detail.play_from_start")}
    </button>`;
  }
  _renderEpisodes(e) {
    return l`
      ${e.type === "Series" && this._seasons.length > 0 ? l`<div class="seasons" role="tablist" aria-label=${this._t("detail.seasons")}>
            ${this._seasons.map(
      (t) => l`<button
                  class="chip"
                  role="tab"
                  aria-selected=${t.id === this._seasonId ? "true" : "false"}
                  @click=${() => void this._selectSeason(t.id)}
                >
                  ${t.name}
                </button>`
    )}
          </div>` : h}
      <h3>${this._t("detail.episodes")}</h3>
      ${this._episodes === null ? l`<div aria-busy="true">
            ${Array.from({ length: 4 }, () => l`<div class="skeleton episode-skel"></div>`)}
          </div>` : this._episodes.length === 0 ? l`<div class="muted" role="status">${this._t("detail.no_episodes")}</div>` : l`<div class="episodes" role="list">
              ${re(
      this._episodes,
      (t) => t.id,
      (t) => this._renderEpisode(t)
    )}
            </div>`}
    `;
  }
  _renderEpisode(e) {
    const t = it(e.runtime_s, this._t("time.h"), this._t("time.min")), i = e.episode_number !== null ? `${e.episode_number}. ` : "", r = e.images.still;
    return l`
      <div role="listitem">
        <button class="episode" @click=${() => this._open(e)}>
          <span class="thumb">
            ${r ? l`<img
                  src=${r}
                  alt=${e.name}
                  loading="lazy"
                  decoding="async"
                  @error=${(s) => s.target.remove()}
                />` : h}
            <ha-icon class="thumb-icon" icon="mdi:television-play"></ha-icon>
            ${e.progress > 0 && e.progress < 1 ? l`<span class="progress" aria-hidden="true"
                  ><span style="width:${Math.round(e.progress * 100)}%"></span
                ></span>` : h}
          </span>
          <span class="episode-text">
            <span class="episode-title">${i}${e.name}</span>
            ${t ? l`<span class="muted small">${t}</span>` : h}
          </span>
          ${e.played ? l`<ha-icon
                class="seen"
                icon="mdi:check-circle"
                role="img"
                aria-label=${this._t("detail.played")}
              ></ha-icon>` : h}
        </button>
      </div>
    `;
  }
  _renderSkeleton() {
    return l`
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
x.styles = [
  L,
  N`
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
S([
  m({ attribute: !1 })
], x.prototype, "api", 2);
S([
  m()
], x.prototype, "language", 2);
S([
  m()
], x.prototype, "itemId", 2);
S([
  m({ type: Number })
], x.prototype, "refreshKey", 2);
S([
  d()
], x.prototype, "_item", 2);
S([
  d()
], x.prototype, "_error", 2);
S([
  d()
], x.prototype, "_seasons", 2);
S([
  d()
], x.prototype, "_seasonId", 2);
S([
  d()
], x.prototype, "_episodes", 2);
S([
  d()
], x.prototype, "_expanded", 2);
S([
  d()
], x.prototype, "_clamped", 2);
S([
  d()
], x.prototype, "_posterFailed", 2);
S([
  d()
], x.prototype, "_backdropFailed", 2);
S([
  se(".overview")
], x.prototype, "_overview", 2);
x = S([
  R("emby-library-detail")
], x);
var Ri = Object.defineProperty, ji = Object.getOwnPropertyDescriptor, ge = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? ji(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (r ? o(t, i, s) : o(s)) || s);
  return r && s && Ri(t, i, s), s;
};
const zi = 8;
let J = class extends E {
  constructor() {
    super(...arguments), this.heading = "", this.items = null, this.shape = "poster", this.language = "en";
  }
  render() {
    return l`
      <section aria-label=${this.heading}>
        <h3>${this.heading}</h3>
        <div
          class="row ${this.shape}"
          role="list"
          aria-busy=${this.items === null ? "true" : "false"}
          @wheel=${this._onWheel}
        >
          ${this.items === null ? Array.from(
      { length: zi },
      () => l`<div class="cell" aria-hidden="true">
                  <div class="skeleton image"></div>
                  <div class="skeleton line"></div>
                </div>`
    ) : re(
      this.items,
      (e) => e.id,
      (e) => l`<div class="cell" role="listitem">
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
  /** Let a vertical mouse wheel scroll the row while it can still move. */
  _onWheel(e) {
    if (e.ctrlKey || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
    const t = e.currentTarget, i = t.scrollWidth - t.clientWidth;
    if (i <= 0) return;
    const r = t.scrollLeft <= 0 && e.deltaY < 0, s = t.scrollLeft >= i - 1 && e.deltaY > 0;
    r || s || (e.preventDefault(), t.scrollLeft += e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY);
  }
};
J.styles = [
  L,
  N`
      :host {
        display: block;
      }
      h3 {
        margin: 0 0 8px;
        padding: 0 16px;
        font-size: 1.05em;
        font-weight: 500;
      }
      .row {
        display: flex;
        gap: var(--el-gap);
        overflow-x: auto;
        overflow-y: hidden;
        padding: 2px 16px 10px;
        scroll-padding: 0 16px;
        scroll-snap-type: x proximity;
        scrollbar-width: thin;
        overscroll-behavior-x: contain;
        -webkit-overflow-scrolling: touch;
      }
      .cell {
        flex: 0 0 var(--el-poster-width, 150px);
        scroll-snap-align: start;
        min-width: 0;
      }
      .row.still .cell {
        flex-basis: calc(var(--el-poster-width, 150px) * 1.75);
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
ge([
  m()
], J.prototype, "heading", 2);
ge([
  m({ attribute: !1 })
], J.prototype, "items", 2);
ge([
  m()
], J.prototype, "shape", 2);
ge([
  m()
], J.prototype, "language", 2);
J = ge([
  R("emby-library-shelf")
], J);
var Li = Object.defineProperty, Ui = Object.getOwnPropertyDescriptor, V = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? Ui(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (r ? o(t, i, s) : o(s)) || s);
  return r && s && Li(t, i, s), s;
};
const Hi = {
  resume: "shelf.resume",
  next_up: "shelf.next_up",
  latest: "shelf.latest",
  suggestions: "shelf.suggestions"
};
let D = class extends E {
  constructor() {
    super(...arguments), this.language = "en", this.shelves = [], this.limit = 20, this.refreshKey = 0, this._rows = {}, this._error = null, this._generation = 0;
  }
  willUpdate(e) {
    e.has("api") || e.has("shelves") || e.has("limit") ? this._load(!1) : e.has("refreshKey") && this._load(!0);
  }
  _load(e) {
    const t = ++this._generation, i = {};
    for (const o of this.shelves) {
      const a = this._rows[o];
      i[o] = e && Array.isArray(a) ? a : "loading";
    }
    this._rows = i, this._error = null;
    let r = 0, s = "unknown";
    const n = this.shelves.map(async (o) => {
      let a;
      try {
        const c = await this.api.shelf(o, this.limit);
        a = c.length > 0 ? c : "hidden";
      } catch (c) {
        r += 1, s = M(c).code, a = "hidden";
      }
      t === this._generation && (this._rows = { ...this._rows, [o]: a });
    });
    Promise.all(n).then(() => {
      t === this._generation && this.shelves.length > 0 && r === this.shelves.length && (this._error = s);
    });
  }
  render() {
    if (this._error !== null) return _e(this.language, this._error, () => this._load(!1));
    const e = this.shelves.filter((t) => this._rows[t] !== "hidden");
    return e.length === 0 ? me(A(this.language, "home.empty")) : l`
      ${e.map((t) => {
      const i = this._rows[t];
      return i === void 0 ? h : l`<emby-library-shelf
          .heading=${A(this.language, Hi[t])}
          .items=${i === "loading" ? null : i}
          .shape=${t === "resume" ? "still" : "poster"}
          .language=${this.language}
        ></emby-library-shelf>`;
    })}
    `;
  }
};
D.styles = [
  L,
  N`
      :host {
        display: block;
        padding: 8px 0;
      }
      emby-library-shelf + emby-library-shelf {
        margin-top: 8px;
      }
    `
];
V([
  m({ attribute: !1 })
], D.prototype, "api", 2);
V([
  m()
], D.prototype, "language", 2);
V([
  m({ attribute: !1 })
], D.prototype, "shelves", 2);
V([
  m({ type: Number })
], D.prototype, "limit", 2);
V([
  m({ type: Number })
], D.prototype, "refreshKey", 2);
V([
  d()
], D.prototype, "_rows", 2);
V([
  d()
], D.prototype, "_error", 2);
D = V([
  R("emby-library-home")
], D);
var Fi = Object.defineProperty, Ki = Object.getOwnPropertyDescriptor, w = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? Ki(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (r ? o(t, i, s) : o(s)) || s);
  return r && s && Fi(t, i, s), s;
};
const Vi = 60, Pe = 600, Bi = 120, qi = 240, Wi = [
  "SortName",
  "DateCreated",
  "PremiereDate",
  "CommunityRating",
  "DatePlayed"
], Gi = {
  movies: "mdi:movie-outline",
  tvshows: "mdi:television-classic",
  boxsets: "mdi:filmstrip-box-multiple",
  mixed: "mdi:folder-play-outline"
};
let v = class extends E {
  constructor() {
    super(...arguments), this.language = "en", this.parent = null, this.refreshKey = 0, this._views = null, this._items = [], this._total = null, this._loading = !1, this._error = null, this._sortBy = "SortName", this._sortOrder = "asc", this._unplayed = !1, this._windowStart = 0, this._spacer = 0, this._generation = 0;
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
    e.has("api") || e.has("parent") ? this._reload() : e.has("refreshKey") && (this._error !== null || this.parent === null) && this._reload();
  }
  updated() {
    const e = this._observer;
    e && (e.disconnect(), this._bottom && e.observe(this._bottom), this._spacerElement && this._windowStart > 0 && e.observe(this._spacerElement));
  }
  _reload() {
    this._generation += 1, this._error = null, this._items = [], this._total = null, this._windowStart = 0, this._spacer = 0, this._loading = !1, this.parent === null ? this._loadViews() : this._loadMore();
  }
  async _loadViews() {
    const e = this._generation;
    this._views = null;
    try {
      const t = await this.api.views();
      e === this._generation && (this._views = t);
    } catch (t) {
      e === this._generation && (this._error = M(t).code);
    }
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
        parent_id: this.parent.id,
        sort_by: this._sortBy,
        sort_order: this._sortOrder,
        start_index: this._items.length,
        limit: Vi,
        filter: this._unplayed ? "unplayed" : void 0
      });
      if (e !== this._generation) return;
      this._items = [...this._items, ...t.items], this._total = t.items.length === 0 ? this._items.length : t.total, this._setWindow(
        ai(this._windowStart, this._items.length, Pe, this._columns())
      );
    } catch (t) {
      e === this._generation && (this._error = M(t).code);
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
        this._windowStart + Pe < this._items.length ? this._setWindow(this._windowStart + Math.ceil(Bi / i) * i) : this._loadMore();
      else if (t.target === this._spacerElement && this._windowStart > 0) {
        const r = this._rowHeight();
        if (r <= 0) continue;
        const s = Math.max(0, t.intersectionRect.top - t.boundingClientRect.top), n = Math.ceil(qi / i), o = Math.floor(s / r) - n;
        this._setWindow(Math.min(Math.max(0, o * i), this._windowStart - i));
      }
    }
  }
  _openView(e) {
    T(this, "emby-open-item", {
      item: { id: e.id, type: "Folder", name: e.name, is_folder: !0 }
    });
  }
  _setSort(e) {
    this._sortBy = e.target.value, this._reload();
  }
  _toggleOrder() {
    this._sortOrder = this._sortOrder === "asc" ? "desc" : "asc", this._reload();
  }
  _toggleUnplayed() {
    this._unplayed = !this._unplayed, this._reload();
  }
  render() {
    return this.parent === null ? this._renderViews() : this._renderGrid();
  }
  _renderViews() {
    return this._error !== null ? _e(this.language, this._error, () => this._reload()) : this._views === null ? l`<div class="views" aria-busy="true">
        ${Array.from({ length: 4 }, () => l`<div class="skeleton view"></div>`)}
      </div>` : this._views.length === 0 ? me(A(this.language, "library.no_views"), "mdi:folder-off-outline") : l`
      <div class="views" role="list">
        ${this._views.map(
      (e) => l`
            <div role="listitem">
              <button class="view" @click=${() => this._openView(e)}>
                ${e.image ? l`<img
                      src=${e.image}
                      alt=${e.name}
                      loading="lazy"
                      decoding="async"
                      @error=${(t) => t.target.remove()}
                    />` : h}
                <span class="view-label">
                  <ha-icon icon=${Gi[e.collection_type]}></ha-icon>
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
    const e = (s, n) => A(this.language, s, n), t = this._items.slice(this._windowStart, this._windowStart + Pe), i = this._loading && this._items.length === 0, r = !this._loading && this._error === null && this._items.length === 0;
    return l`
      <div class="toolbar">
        <label class="sort">
          <span class="sr-only">${e("library.sort")}</span>
          <select @change=${this._setSort} .value=${this._sortBy}>
            ${Wi.map(
      (s) => l`<option value=${s} ?selected=${s === this._sortBy}>
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
        <button
          class="chip"
          aria-pressed=${this._unplayed ? "true" : "false"}
          @click=${this._toggleUnplayed}
        >
          <ha-icon icon="mdi:eye-off-outline"></ha-icon>${e("library.unplayed")}
        </button>
        ${this._total !== null && this._total > 0 ? l`<span class="count muted">${e("library.count", { count: this._total })}</span>` : h}
      </div>

      ${r ? me(e(this._unplayed ? "library.empty_unplayed" : "library.empty")) : l`
            <div class="spacer" style="height:${this._spacer}px"></div>
            <div class="grid" role="list" aria-busy=${this._loading ? "true" : "false"}>
              ${re(
      t,
      (s) => s.id,
      (s) => l`<emby-library-poster
                    role="listitem"
                    .item=${s}
                    .language=${this.language}
                  ></emby-library-poster>`
    )}
              ${i ? Array.from(
      { length: 18 },
      () => l`<div aria-hidden="true">
                      <div class="skeleton poster"></div>
                      <div class="skeleton line"></div>
                    </div>`
    ) : h}
            </div>
          `}
      ${this._error !== null ? _e(this.language, this._error, () => {
      this._error = null, this._loadMore();
    }) : h}
      ${this._loading && this._items.length > 0 ? l`<div class="more muted" role="status">${e("library.loading_more")}…</div>` : h}
      <div class="sentinel bottom"></div>
    `;
  }
};
v.styles = [
  L,
  N`
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
      .count {
        margin-left: auto;
        font-size: 0.85em;
      }
      .grid {
        display: grid;
        gap: 16px var(--el-gap);
        grid-template-columns: repeat(
          auto-fill,
          minmax(min(var(--el-poster-width, 150px), 45%), 1fr)
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
w([
  m({ attribute: !1 })
], v.prototype, "api", 2);
w([
  m()
], v.prototype, "language", 2);
w([
  m({ attribute: !1 })
], v.prototype, "parent", 2);
w([
  m({ type: Number })
], v.prototype, "refreshKey", 2);
w([
  d()
], v.prototype, "_views", 2);
w([
  d()
], v.prototype, "_items", 2);
w([
  d()
], v.prototype, "_total", 2);
w([
  d()
], v.prototype, "_loading", 2);
w([
  d()
], v.prototype, "_error", 2);
w([
  d()
], v.prototype, "_sortBy", 2);
w([
  d()
], v.prototype, "_sortOrder", 2);
w([
  d()
], v.prototype, "_unplayed", 2);
w([
  d()
], v.prototype, "_windowStart", 2);
w([
  d()
], v.prototype, "_spacer", 2);
w([
  se(".grid")
], v.prototype, "_grid", 2);
w([
  se(".sentinel.bottom")
], v.prototype, "_bottom", 2);
w([
  se(".spacer")
], v.prototype, "_spacerElement", 2);
v = w([
  R("emby-library-library")
], v);
var Yi = Object.defineProperty, Ji = Object.getOwnPropertyDescriptor, z = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? Ji(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (r ? o(t, i, s) : o(s)) || s);
  return r && s && Yi(t, i, s), s;
};
const Zi = 300, Oe = 2;
let P = class extends E {
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
    this._loading = !0, this._timer = setTimeout(() => this._run(), Zi);
  }
  _run() {
    const e = this._term.trim();
    if (e.length < Oe) return;
    const t = ++this._sequence;
    this._loading = !0, this._error = null, this.api.search(e).then((i) => {
      t === this._sequence && (this._results = i, this._searched = e, this._loading = !1);
    }).catch((i) => {
      t === this._sequence && (this._error = M(i).code, this._loading = !1);
    });
  }
  _clear() {
    clearTimeout(this._timer), this._sequence += 1, this._term = "", this._results = null, this._loading = !1, this._error = null, this.focusInput();
  }
  render() {
    const e = (t, i) => A(this.language, t, i);
    return l`
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
        ${this._term ? l`<button class="icon-button" aria-label=${e("search.clear")} @click=${this._clear}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>` : h}
      </div>
      <div aria-live="polite">${this._renderBody(e)}</div>
    `;
  }
  _renderBody(e) {
    if (this._error !== null) return _e(this.language, this._error, () => this._run());
    if (this._term.trim().length < Oe)
      return me(e("search.hint"), "mdi:magnify");
    if (this._results === null || this._loading && this._results.length === 0)
      return l`<div class="grid" aria-busy="true">
        ${Array.from(
        { length: 12 },
        () => l`<div aria-hidden="true">
            <div class="skeleton poster"></div>
            <div class="skeleton line"></div>
          </div>`
      )}
      </div>`;
    if (this._results.length === 0)
      return me(e("search.empty", { term: this._searched }), "mdi:magnify-close");
    const t = oi(this._results);
    return l`
      ${this._renderGroup(e("search.movies"), t.movies, "poster")}
      ${this._renderGroup(e("search.series"), t.series, "poster")}
      ${this._renderGroup(e("search.episodes"), t.episodes, "still")}
    `;
  }
  _renderGroup(e, t, i) {
    return t.length === 0 ? h : l`
      <section aria-label=${e}>
        <h3>${e}</h3>
        <div class="grid ${i}" role="list">
          ${re(
      t,
      (r) => r.id,
      (r) => l`<emby-library-poster
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
P.styles = [
  L,
  N`
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
          minmax(min(var(--el-poster-width, 150px), 45%), 1fr)
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
z([
  m({ attribute: !1 })
], P.prototype, "api", 2);
z([
  m()
], P.prototype, "language", 2);
z([
  m({ type: Number })
], P.prototype, "refreshKey", 2);
z([
  d()
], P.prototype, "_term", 2);
z([
  d()
], P.prototype, "_results", 2);
z([
  d()
], P.prototype, "_searched", 2);
z([
  d()
], P.prototype, "_loading", 2);
z([
  d()
], P.prototype, "_error", 2);
z([
  se("input")
], P.prototype, "_input", 2);
P = z([
  R("emby-library-search")
], P);
var Xi = Object.defineProperty, Qi = Object.getOwnPropertyDescriptor, $ = (e, t, i, r) => {
  for (var s = r > 1 ? void 0 : r ? Qi(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (s = (r ? o(t, i, s) : o(s)) || s);
  return r && s && Xi(t, i, s), s;
};
const es = "0.3.1", ts = 6e4, is = 1e4, ss = 6e3, rs = {
  home: "mdi:home-outline",
  library: "mdi:filmstrip-box-multiple",
  search: "mdi:magnify"
}, lt = {
  home: "nav.home",
  library: "nav.library",
  search: "nav.search"
}, ns = {
  play: "media_play",
  pause: "media_pause",
  stop: "media_stop",
  next: "media_next_track",
  previous: "media_previous_track"
};
let b = class extends E {
  constructor() {
    super(...arguments), this._lang = "en", this._entry = null, this._problem = null, this._tab = "home", this._stacks = { home: [], library: [], search: [] }, this._sessions = [], this._clients = [], this._receivedAt = 0, this._available = !0, this._refreshKey = 0, this._picker = null, this._message = null, this._selectedDevice = null, this._volumes = {}, this._volumesKey = "{}", this._controls = {}, this._controlsKey = "{}", this._generation = 0, this._nextKey = 1, this._waiters = /* @__PURE__ */ new Set(), this._scroll = /* @__PURE__ */ new Map(), this._onReady = () => {
      this._problem !== null || this._api === void 0 ? this._init() : this._refreshKey += 1;
    }, this._onPlay = (e) => {
      e.stopPropagation(), this._requestPlay(e.detail);
    }, this._onControl = (e) => {
      e.stopPropagation();
      const { sessionId: t, command: i, value: r } = e.detail;
      this._visibleSessions.some((s) => s.session_id === t) && this._api?.control(t, i, r).catch((s) => {
        this._show(ve(this._lang, M(s).code));
      });
    }, this._onVolume = (e) => {
      e.stopPropagation();
      const t = this._hass, { entityId: i, level: r, muted: s } = e.detail, n = this._targets.some((a) => a.volume_entity === i);
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
      const t = this._hass, { entityId: i, command: r } = e.detail, s = ns[r], n = this._targets.some((o) => o.control_entity === i);
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
    const t = this._config, i = te(e);
    this._config = i, (t === void 0 || t.start_view !== i.start_view) && this._showTab(i.start_view), !i.show_search && this._tab === "search" && this._showTab("home"), t !== void 0 && t.entry !== i.entry && this._init(), this._updateVolumes();
  }
  /** Re-render only when a configured volume_entity or control_entity changes. */
  _updateVolumes() {
    const e = this._targets;
    if (e.length === 0 && this._volumesKey === "{}" && this._controlsKey === "{}") return;
    const t = hi(e, this._hass?.states), i = JSON.stringify(t);
    i !== this._volumesKey && (this._volumesKey = i, this._volumes = t);
    const r = ui(e, this._hass?.states), s = JSON.stringify(r);
    s !== this._controlsKey && (this._controlsKey = s, this._controls = r);
  }
  set hass(e) {
    const t = this._hass;
    this._hass = e;
    const i = _t(e);
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
    super.connectedCallback(), this.addEventListener("emby-open-item", this._onOpenItem), this.addEventListener("emby-play", this._onPlay), this.addEventListener("emby-control", this._onControl), this.addEventListener("emby-volume", this._onVolume), this.addEventListener("emby-media", this._onMedia), this.addEventListener("emby-error", this._onViewError), this._hass && (this._hass.connection.addEventListener("ready", this._onReady), this._init());
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.removeEventListener("emby-open-item", this._onOpenItem), this.removeEventListener("emby-play", this._onPlay), this.removeEventListener("emby-control", this._onControl), this.removeEventListener("emby-volume", this._onVolume), this.removeEventListener("emby-media", this._onMedia), this.removeEventListener("emby-error", this._onViewError), this._hass?.connection.removeEventListener("ready", this._onReady), this._generation += 1, this._stopSessions(), clearTimeout(this._messageTimer), clearTimeout(this._refreshTimer), this._waiters.clear();
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
      r = await new $e(e).entries();
    } catch {
      r = [];
    }
    if (i !== this._generation) return;
    let s, n = null;
    if (r.length === 0 ? n = "no_entry" : t.entry !== void 0 ? (s = r.find((c) => c.entry_id === t.entry), s || (n = "entry_not_found")) : r.length === 1 ? s = r[0] : n = "entry_required", this._problem = n, !s) {
      this._entry = null, this._api = void 0;
      return;
    }
    const o = this._entry?.entry_id !== s.entry_id;
    this._entry = s;
    const a = new $e(e, s.entry_id);
    this._api = a, this._selectedDevice = this._readStoredDevice(s.entry_id), o && (this._stacks = { home: [], library: [], search: [] }, this._sessions = [], this._clients = [], this._showTab(this._tab));
    try {
      const c = await a.subscribeSessions((p) => this._onSessions(p));
      i !== this._generation ? c() : this._unsubscribe = c;
    } catch (c) {
      i === this._generation && (this._problem = M(c).code);
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
          const a = e(o);
          return a === null ? !1 : (clearTimeout(n), r(a), !0);
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
    return e ? ni(
      this._selectedDevice,
      e.default_target,
      this._visibleSessions,
      this._targets
    ) : null;
  }
  get _targets() {
    return rt(
      ri(this._clients, this._config?.targets ?? []),
      this._config?.allowed_targets ?? null
    );
  }
  get _visibleSessions() {
    return rt(this._sessions, this._config?.allowed_targets ?? null);
  }
  _allowsDevice(e) {
    const t = this._config?.allowed_targets ?? null;
    return t === null || t.includes(e);
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
      const a = M(o).code;
      this._show(ve(this._lang, a)), (a === "session_not_found" || a === "not_controllable") && (this._picker = { pending: t });
      return;
    }
    await this._waitFor(
      (o) => o.find(
        (a) => a.session_id === e.session_id && a.now_playing?.id === s
      ) ?? null,
      is
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
      (a) => nt(e.device_id, a),
      ts
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
    return A(this._lang, e, t);
  }
  _show(e, t = !1) {
    clearTimeout(this._messageTimer), this._message = e, e !== null && !t && (this._messageTimer = setTimeout(() => this._message = null, ss));
  }
  // --- Rendering ----------------------------------------------------------------
  render() {
    const e = this._config;
    if (!e) return h;
    const t = typeof e.height == "number", i = `--el-poster-width:${yi[e.poster_size]}px;${t ? `height:${e.height}px;` : ""}`;
    if (this._problem !== null)
      return l`<ha-card style=${i}>${this._renderProblem(this._problem)}</ha-card>`;
    const r = this._api;
    return r ? l`
      <ha-card class=${t ? "fixed" : "auto"} style=${i}>
        ${this._renderHeader(e)}
        ${this._available ? h : l`<div class="banner" role="status">
              <ha-icon icon="mdi:lan-disconnect"></ha-icon>${this._t("error.unreachable")}
            </div>`}
        <div class="content">
          ${Object.keys(this._stacks).map(
      (s) => re(
        this._stacks[s],
        (n) => n.key,
        (n, o) => l`<div
                  class="level"
                  ?hidden=${s !== this._tab || o !== this._stacks[s].length - 1}
                >
                  ${this._renderLevel(n, r, e)}
                </div>`
      )
    )}
        </div>
        ${this._message !== null ? l`<div class="toast" role="status" aria-live="polite">${this._message}</div>` : h}
        ${e.show_now_playing ? l`<emby-library-now-playing
              class="now-playing"
              .language=${this._lang}
              .sessions=${this._visibleSessions}
              .volumes=${this._volumes}
              .controls=${this._controls}
              .receivedAt=${this._receivedAt}
            ></emby-library-now-playing>` : h}
        ${this._picker !== null ? l`<emby-library-target-picker
              .language=${this._lang}
              .sessions=${this._visibleSessions}
              .targets=${this._targets}
              .selectedDeviceId=${this._device}
              @emby-target-chosen=${this._onTargetChosen}
              @emby-close=${() => this._picker = null}
            ></emby-library-target-picker>` : h}
      </ha-card>
    ` : l`<ha-card style=${i} aria-busy="true">
        <div class="boot"><div class="skeleton"></div></div>
      </ha-card>`;
  }
  _renderHeader(e) {
    const t = e.show_search ? ["home", "library", "search"] : ["home", "library"], i = this._stack, r = this._deviceName(this._device);
    return l`
      <header>
        <nav class="tabs" aria-label=${this._t("nav.views")}>
          ${t.map(
      (s) => l`<button
                class="tab"
                aria-label=${this._t(lt[s])}
                aria-current=${s === this._tab ? "page" : "false"}
                @click=${() => this._onTab(s)}
              >
                <ha-icon icon=${rs[s]}></ha-icon>
                <span class="tab-label">${this._t(lt[s])}</span>
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
        ${i.length > 1 ? l`<div class="crumbs">
              <button class="icon-button" aria-label=${this._t("nav.back")} @click=${this._back}>
                <ha-icon icon="mdi:arrow-left"></ha-icon>
              </button>
              <nav aria-label=${this._t("nav.breadcrumb")}>
                <ol>
                  ${i.map((s, n) => {
      const o = n === i.length - 1, a = this._levelName(s);
      return l`<li>
                      ${o ? l`<span aria-current="page">${a}</span>` : l`<button @click=${() => this._popTo(n + 1)}>${a}</button>
                            <ha-icon icon="mdi:chevron-right" aria-hidden="true"></ha-icon>`}
                    </li>`;
    })}
                </ol>
              </nav>
            </div>` : h}
      </header>
    `;
  }
  _levelName(e) {
    return e.kind === "home" ? this._t("nav.home") : e.kind === "views" ? this._t("nav.library") : e.kind === "search" ? this._t("nav.search") : e.name;
  }
  _renderLevel(e, t, i) {
    switch (e.kind) {
      case "home":
        return l`<emby-library-home
          .api=${t}
          .language=${this._lang}
          .shelves=${i.shelves}
          .limit=${i.shelf_limit}
          .refreshKey=${this._refreshKey}
        ></emby-library-home>`;
      case "views":
        return l`<emby-library-library
          .api=${t}
          .language=${this._lang}
          .parent=${null}
          .refreshKey=${this._refreshKey}
        ></emby-library-library>`;
      case "items":
        return l`<emby-library-library
          .api=${t}
          .language=${this._lang}
          .parent=${e}
          .refreshKey=${this._refreshKey}
        ></emby-library-library>`;
      case "detail":
        return l`<emby-library-detail
          .api=${t}
          .language=${this._lang}
          .itemId=${e.id}
          .refreshKey=${this._refreshKey}
        ></emby-library-detail>`;
      case "search":
        return l`<emby-library-search
          .api=${t}
          .language=${this._lang}
          .refreshKey=${this._refreshKey}
        ></emby-library-search>`;
    }
  }
  _renderProblem(e) {
    return e === "no_entry" ? l`<div class="state" role="status">
        <ha-icon icon="mdi:movie-open-plus-outline"></ha-icon>
        <div>${this._t("error.no_entry")}</div>
        <a class="button" href="/config/integrations/dashboard/add?domain=emby_library"
          >${this._t("error.open_integrations")}</a
        >
      </div>` : l`<div class="state error" role="alert">
      <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
      <div>${ve(this._lang, e)}</div>
      ${e === "emby_unreachable" || e === "unknown" ? l`<button class="button" @click=${() => void this._init()}>
            <ha-icon icon="mdi:refresh"></ha-icon>${this._t("error.retry")}
          </button>` : h}
      ${e === "entry_required" || e === "entry_not_found" ? l`<a class="button" href="?edit=1">${this._t("error.edit_dashboard")}</a>` : h}
    </div>`;
  }
};
b.styles = [
  L,
  N`
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
$([
  d()
], b.prototype, "_config", 2);
$([
  d()
], b.prototype, "_lang", 2);
$([
  d()
], b.prototype, "_api", 2);
$([
  d()
], b.prototype, "_entry", 2);
$([
  d()
], b.prototype, "_problem", 2);
$([
  d()
], b.prototype, "_tab", 2);
$([
  d()
], b.prototype, "_stacks", 2);
$([
  d()
], b.prototype, "_sessions", 2);
$([
  d()
], b.prototype, "_clients", 2);
$([
  d()
], b.prototype, "_receivedAt", 2);
$([
  d()
], b.prototype, "_available", 2);
$([
  d()
], b.prototype, "_refreshKey", 2);
$([
  d()
], b.prototype, "_picker", 2);
$([
  d()
], b.prototype, "_message", 2);
$([
  d()
], b.prototype, "_selectedDevice", 2);
$([
  d()
], b.prototype, "_volumes", 2);
$([
  d()
], b.prototype, "_controls", 2);
b = $([
  R("emby-library-card")
], b);
window.customCards = window.customCards ?? [];
window.customCards.some((e) => e.type === "emby-library-card") || window.customCards.push({
  type: "emby-library-card",
  name: "Emby Library",
  description: "Browse, search and play your Emby movies and series.",
  preview: !1
});
console.info(`%c EMBY-LIBRARY-CARD %c ${es} `, "font-weight:700", "");
export {
  es as CARD_VERSION,
  b as EmbyLibraryCard
};
