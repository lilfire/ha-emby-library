/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const me = globalThis, Te = me.ShadowRoot && (me.ShadyCSS === void 0 || me.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Me = Symbol(), je = /* @__PURE__ */ new WeakMap();
let ot = class {
  constructor(t, i, s) {
    if (this._$cssResult$ = !0, s !== Me) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = i;
  }
  get styleSheet() {
    let t = this.o;
    const i = this.t;
    if (Te && t === void 0) {
      const s = i !== void 0 && i.length === 1;
      s && (t = je.get(i)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && je.set(i, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const ft = (e) => new ot(typeof e == "string" ? e : e + "", void 0, Me), P = (e, ...t) => {
  const i = e.length === 1 ? e[0] : t.reduce((s, r, n) => s + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + e[n + 1], e[0]);
  return new ot(i, e, Me);
}, yt = (e, t) => {
  if (Te) e.adoptedStyleSheets = t.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
  else for (const i of t) {
    const s = document.createElement("style"), r = me.litNonce;
    r !== void 0 && s.setAttribute("nonce", r), s.textContent = i.cssText, e.appendChild(s);
  }
}, Le = Te ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let i = "";
  for (const s of t.cssRules) i += s.cssText;
  return ft(i);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: vt, defineProperty: bt, getOwnPropertyDescriptor: $t, getOwnPropertyNames: wt, getOwnPropertySymbols: xt, getPrototypeOf: kt } = Object, be = globalThis, Ue = be.trustedTypes, St = Ue ? Ue.emptyScript : "", Et = be.reactiveElementPolyfillSupport, ae = (e, t) => e, fe = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? St : null;
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
} }, Ie = (e, t) => !vt(e, t), He = { attribute: !0, type: String, converter: fe, reflect: !1, useDefault: !1, hasChanged: Ie };
Symbol.metadata ??= Symbol("metadata"), be.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let Z = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, i = He) {
    if (i.state && (i.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((i = Object.create(i)).wrapped = !0), this.elementProperties.set(t, i), !i.noAccessor) {
      const s = Symbol(), r = this.getPropertyDescriptor(t, s, i);
      r !== void 0 && bt(this.prototype, t, r);
    }
  }
  static getPropertyDescriptor(t, i, s) {
    const { get: r, set: n } = $t(this.prototype, t) ?? { get() {
      return this[i];
    }, set(o) {
      this[i] = o;
    } };
    return { get: r, set(o) {
      const l = r?.call(this);
      n?.call(this, o), this.requestUpdate(t, l, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? He;
  }
  static _$Ei() {
    if (this.hasOwnProperty(ae("elementProperties"))) return;
    const t = kt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(ae("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(ae("properties"))) {
      const i = this.properties, s = [...wt(i), ...xt(i)];
      for (const r of s) this.createProperty(r, i[r]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const i = litPropertyMetadata.get(t);
      if (i !== void 0) for (const [s, r] of i) this.elementProperties.set(s, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [i, s] of this.elementProperties) {
      const r = this._$Eu(i, s);
      r !== void 0 && this._$Eh.set(r, i);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const i = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const r of s) i.unshift(Le(r));
    } else t !== void 0 && i.push(Le(t));
    return i;
  }
  static _$Eu(t, i) {
    const s = i.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof t == "string" ? t.toLowerCase() : void 0;
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
    for (const s of i.keys()) this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return yt(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, i, s) {
    this._$AK(t, s);
  }
  _$ET(t, i) {
    const s = this.constructor.elementProperties.get(t), r = this.constructor._$Eu(t, s);
    if (r !== void 0 && s.reflect === !0) {
      const n = (s.converter?.toAttribute !== void 0 ? s.converter : fe).toAttribute(i, s.type);
      this._$Em = t, n == null ? this.removeAttribute(r) : this.setAttribute(r, n), this._$Em = null;
    }
  }
  _$AK(t, i) {
    const s = this.constructor, r = s._$Eh.get(t);
    if (r !== void 0 && this._$Em !== r) {
      const n = s.getPropertyOptions(r), o = typeof n.converter == "function" ? { fromAttribute: n.converter } : n.converter?.fromAttribute !== void 0 ? n.converter : fe;
      this._$Em = r;
      const l = o.fromAttribute(i, n.type);
      this[r] = l ?? this._$Ej?.get(r) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, i, s, r = !1, n) {
    if (t !== void 0) {
      const o = this.constructor;
      if (r === !1 && (n = this[t]), s ??= o.getPropertyOptions(t), !((s.hasChanged ?? Ie)(n, i) || s.useDefault && s.reflect && n === this._$Ej?.get(t) && !this.hasAttribute(o._$Eu(t, s)))) return;
      this.C(t, i, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, i, { useDefault: s, reflect: r, wrapped: n }, o) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, o ?? i ?? this[t]), n !== !0 || o !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (i = void 0), this._$AL.set(t, i)), r === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
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
        for (const [r, n] of this._$Ep) this[r] = n;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [r, n] of s) {
        const { wrapped: o } = n, l = this[r];
        o !== !0 || this._$AL.has(r) || l === void 0 || this.C(r, void 0, n, l);
      }
    }
    let t = !1;
    const i = this._$AL;
    try {
      t = this.shouldUpdate(i), t ? (this.willUpdate(i), this._$EO?.forEach((s) => s.hostUpdate?.()), this.update(i)) : this._$EM();
    } catch (s) {
      throw t = !1, this._$EM(), s;
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
Z.elementStyles = [], Z.shadowRootOptions = { mode: "open" }, Z[ae("elementProperties")] = /* @__PURE__ */ new Map(), Z[ae("finalized")] = /* @__PURE__ */ new Map(), Et?.({ ReactiveElement: Z }), (be.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const De = globalThis, Be = (e) => e, ye = De.trustedTypes, Ke = ye ? ye.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, at = "$lit$", z = `lit$${Math.random().toFixed(9).slice(2)}$`, lt = "?" + z, At = `<${lt}>`, V = document, he = () => V.createComment(""), ce = (e) => e === null || typeof e != "object" && typeof e != "function", Ne = Array.isArray, Ct = (e) => Ne(e) || typeof e?.[Symbol.iterator] == "function", xe = `[ 	
\f\r]`, ne = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Fe = /-->/g, Ve = />/g, B = RegExp(`>|${xe}(?:([^\\s"'>=/]+)(${xe}*=${xe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), qe = /'/g, We = /"/g, ht = /^(?:script|style|textarea|title)$/i, Pt = (e) => (t, ...i) => ({ _$litType$: e, strings: t, values: i }), a = Pt(1), q = Symbol.for("lit-noChange"), c = Symbol.for("lit-nothing"), Ye = /* @__PURE__ */ new WeakMap(), F = V.createTreeWalker(V, 129);
function ct(e, t) {
  if (!Ne(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Ke !== void 0 ? Ke.createHTML(t) : t;
}
const Ot = (e, t) => {
  const i = e.length - 1, s = [];
  let r, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = ne;
  for (let l = 0; l < i; l++) {
    const h = e[l];
    let _, u, p = -1, f = 0;
    for (; f < h.length && (o.lastIndex = f, u = o.exec(h), u !== null); ) f = o.lastIndex, o === ne ? u[1] === "!--" ? o = Fe : u[1] !== void 0 ? o = Ve : u[2] !== void 0 ? (ht.test(u[2]) && (r = RegExp("</" + u[2], "g")), o = B) : u[3] !== void 0 && (o = B) : o === B ? u[0] === ">" ? (o = r ?? ne, p = -1) : u[1] === void 0 ? p = -2 : (p = o.lastIndex - u[2].length, _ = u[1], o = u[3] === void 0 ? B : u[3] === '"' ? We : qe) : o === We || o === qe ? o = B : o === Fe || o === Ve ? o = ne : (o = B, r = void 0);
    const g = o === B && e[l + 1].startsWith("/>") ? " " : "";
    n += o === ne ? h + At : p >= 0 ? (s.push(_), h.slice(0, p) + at + h.slice(p) + z + g) : h + z + (p === -2 ? l : g);
  }
  return [ct(e, n + (e[i] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class de {
  constructor({ strings: t, _$litType$: i }, s) {
    let r;
    this.parts = [];
    let n = 0, o = 0;
    const l = t.length - 1, h = this.parts, [_, u] = Ot(t, i);
    if (this.el = de.createElement(_, s), F.currentNode = this.el.content, i === 2 || i === 3) {
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
    for (; (r = F.nextNode()) !== null && h.length < l; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const p of r.getAttributeNames()) if (p.endsWith(at)) {
          const f = u[o++], g = r.getAttribute(p).split(z), v = /([.?@])?(.*)/.exec(f);
          h.push({ type: 1, index: n, name: v[2], strings: g, ctor: v[1] === "." ? Mt : v[1] === "?" ? It : v[1] === "@" ? Dt : $e }), r.removeAttribute(p);
        } else p.startsWith(z) && (h.push({ type: 6, index: n }), r.removeAttribute(p));
        if (ht.test(r.tagName)) {
          const p = r.textContent.split(z), f = p.length - 1;
          if (f > 0) {
            r.textContent = ye ? ye.emptyScript : "";
            for (let g = 0; g < f; g++) r.append(p[g], he()), F.nextNode(), h.push({ type: 2, index: ++n });
            r.append(p[f], he());
          }
        }
      } else if (r.nodeType === 8) if (r.data === lt) h.push({ type: 2, index: n });
      else {
        let p = -1;
        for (; (p = r.data.indexOf(z, p + 1)) !== -1; ) h.push({ type: 7, index: n }), p += z.length - 1;
      }
      n++;
    }
  }
  static createElement(t, i) {
    const s = V.createElement("template");
    return s.innerHTML = t, s;
  }
}
function Q(e, t, i = e, s) {
  if (t === q) return t;
  let r = s !== void 0 ? i._$Co?.[s] : i._$Cl;
  const n = ce(t) ? void 0 : t._$litDirective$;
  return r?.constructor !== n && (r?._$AO?.(!1), n === void 0 ? r = void 0 : (r = new n(e), r._$AT(e, i, s)), s !== void 0 ? (i._$Co ??= [])[s] = r : i._$Cl = r), r !== void 0 && (t = Q(e, r._$AS(e, t.values), r, s)), t;
}
class Tt {
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
    const { el: { content: i }, parts: s } = this._$AD, r = (t?.creationScope ?? V).importNode(i, !0);
    F.currentNode = r;
    let n = F.nextNode(), o = 0, l = 0, h = s[0];
    for (; h !== void 0; ) {
      if (o === h.index) {
        let _;
        h.type === 2 ? _ = new ee(n, n.nextSibling, this, t) : h.type === 1 ? _ = new h.ctor(n, h.name, h.strings, this, t) : h.type === 6 && (_ = new Nt(n, this, t)), this._$AV.push(_), h = s[++l];
      }
      o !== h?.index && (n = F.nextNode(), o++);
    }
    return F.currentNode = V, r;
  }
  p(t) {
    let i = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, i), i += s.strings.length - 2) : s._$AI(t[i])), i++;
  }
}
class ee {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, i, s, r) {
    this.type = 2, this._$AH = c, this._$AN = void 0, this._$AA = t, this._$AB = i, this._$AM = s, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
    t = Q(this, t, i), ce(t) ? t === c || t == null || t === "" ? (this._$AH !== c && this._$AR(), this._$AH = c) : t !== this._$AH && t !== q && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Ct(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== c && ce(this._$AH) ? this._$AA.nextSibling.data = t : this.T(V.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: i, _$litType$: s } = t, r = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = de.createElement(ct(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === r) this._$AH.p(i);
    else {
      const n = new Tt(r, this), o = n.u(this.options);
      n.p(i), this.T(o), this._$AH = n;
    }
  }
  _$AC(t) {
    let i = Ye.get(t.strings);
    return i === void 0 && Ye.set(t.strings, i = new de(t)), i;
  }
  k(t) {
    Ne(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let s, r = 0;
    for (const n of t) r === i.length ? i.push(s = new ee(this.O(he()), this.O(he()), this, this.options)) : s = i[r], s._$AI(n), r++;
    r < i.length && (this._$AR(s && s._$AB.nextSibling, r), i.length = r);
  }
  _$AR(t = this._$AA.nextSibling, i) {
    for (this._$AP?.(!1, !0, i); t !== this._$AB; ) {
      const s = Be(t).nextSibling;
      Be(t).remove(), t = s;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class $e {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, i, s, r, n) {
    this.type = 1, this._$AH = c, this._$AN = void 0, this.element = t, this.name = i, this._$AM = r, this.options = n, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = c;
  }
  _$AI(t, i = this, s, r) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) t = Q(this, t, i, 0), o = !ce(t) || t !== this._$AH && t !== q, o && (this._$AH = t);
    else {
      const l = t;
      let h, _;
      for (t = n[0], h = 0; h < n.length - 1; h++) _ = Q(this, l[s + h], i, h), _ === q && (_ = this._$AH[h]), o ||= !ce(_) || _ !== this._$AH[h], _ === c ? t = c : t !== c && (t += (_ ?? "") + n[h + 1]), this._$AH[h] = _;
    }
    o && !r && this.j(t);
  }
  j(t) {
    t === c ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Mt extends $e {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === c ? void 0 : t;
  }
}
class It extends $e {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== c);
  }
}
class Dt extends $e {
  constructor(t, i, s, r, n) {
    super(t, i, s, r, n), this.type = 5;
  }
  _$AI(t, i = this) {
    if ((t = Q(this, t, i, 0) ?? c) === q) return;
    const s = this._$AH, r = t === c && s !== c || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, n = t !== c && (s === c || r);
    r && this.element.removeEventListener(this.name, this, s), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Nt {
  constructor(t, i, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    Q(this, t);
  }
}
const Rt = { I: ee }, zt = De.litHtmlPolyfillSupport;
zt?.(de, ee), (De.litHtmlVersions ??= []).push("3.3.3");
const jt = (e, t, i) => {
  const s = i?.renderBefore ?? t;
  let r = s._$litPart$;
  if (r === void 0) {
    const n = i?.renderBefore ?? null;
    s._$litPart$ = r = new ee(t.insertBefore(he(), n), n, void 0, i ?? {});
  }
  return r._$AI(e), r;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Re = globalThis;
let S = class extends Z {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const i = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = jt(i, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return q;
  }
};
S._$litElement$ = !0, S.finalized = !0, Re.litElementHydrateSupport?.({ LitElement: S });
const Lt = Re.litElementPolyfillSupport;
Lt?.({ LitElement: S });
(Re.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const T = (e) => (t, i) => {
  i !== void 0 ? i.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ut = { attribute: !0, type: String, converter: fe, reflect: !1, hasChanged: Ie }, Ht = (e = Ut, t, i) => {
  const { kind: s, metadata: r } = i;
  let n = globalThis.litPropertyMetadata.get(r);
  if (n === void 0 && globalThis.litPropertyMetadata.set(r, n = /* @__PURE__ */ new Map()), s === "setter" && ((e = Object.create(e)).wrapped = !0), n.set(i.name, e), s === "accessor") {
    const { name: o } = i;
    return { set(l) {
      const h = t.get.call(this);
      t.set.call(this, l), this.requestUpdate(o, h, e, !0, l);
    }, init(l) {
      return l !== void 0 && this.C(o, void 0, e, l), l;
    } };
  }
  if (s === "setter") {
    const { name: o } = i;
    return function(l) {
      const h = this[o];
      t.call(this, l), this.requestUpdate(o, h, e, !0, l);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function m(e) {
  return (t, i) => typeof i == "object" ? Ht(e, t, i) : ((s, r, n) => {
    const o = r.hasOwnProperty(n);
    return r.constructor.createProperty(n, s), o ? Object.getOwnPropertyDescriptor(r, n) : void 0;
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
function te(e, t) {
  return (i, s, r) => {
    const n = (o) => o.renderRoot?.querySelector(e) ?? null;
    return Bt(i, s, { get() {
      return n(this);
    } });
  };
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Kt = { CHILD: 2 }, Ft = (e) => (...t) => ({ _$litDirective$: e, values: t });
let Vt = class {
  constructor(t) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t, i, s) {
    this._$Ct = t, this._$AM = i, this._$Ci = s;
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
const { I: qt } = Rt, Ge = (e) => e, Ze = () => document.createComment(""), oe = (e, t, i) => {
  const s = e._$AA.parentNode, r = t === void 0 ? e._$AB : t._$AA;
  if (i === void 0) {
    const n = s.insertBefore(Ze(), r), o = s.insertBefore(Ze(), r);
    i = new qt(n, o, e, e.options);
  } else {
    const n = i._$AB.nextSibling, o = i._$AM, l = o !== e;
    if (l) {
      let h;
      i._$AQ?.(e), i._$AM = e, i._$AP !== void 0 && (h = e._$AU) !== o._$AU && i._$AP(h);
    }
    if (n !== r || l) {
      let h = i._$AA;
      for (; h !== n; ) {
        const _ = Ge(h).nextSibling;
        Ge(s).insertBefore(h, r), h = _;
      }
    }
  }
  return i;
}, K = (e, t, i = e) => (e._$AI(t, i), e), Wt = {}, Yt = (e, t = Wt) => e._$AH = t, Gt = (e) => e._$AH, ke = (e) => {
  e._$AR(), e._$AA.remove();
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Xe = (e, t, i) => {
  const s = /* @__PURE__ */ new Map();
  for (let r = t; r <= i; r++) s.set(e[r], r);
  return s;
}, ie = Ft(class extends Vt {
  constructor(e) {
    if (super(e), e.type !== Kt.CHILD) throw Error("repeat() can only be used in text expressions");
  }
  dt(e, t, i) {
    let s;
    i === void 0 ? i = t : t !== void 0 && (s = t);
    const r = [], n = [];
    let o = 0;
    for (const l of e) r[o] = s ? s(l, o) : o, n[o] = i(l, o), o++;
    return { values: n, keys: r };
  }
  render(e, t, i) {
    return this.dt(e, t, i).values;
  }
  update(e, [t, i, s]) {
    const r = Gt(e), { values: n, keys: o } = this.dt(t, i, s);
    if (!Array.isArray(r)) return this.ut = o, n;
    const l = this.ut ??= [], h = [];
    let _, u, p = 0, f = r.length - 1, g = 0, v = n.length - 1;
    for (; p <= f && g <= v; ) if (r[p] === null) p++;
    else if (r[f] === null) f--;
    else if (l[p] === o[g]) h[g] = K(r[p], n[g]), p++, g++;
    else if (l[f] === o[v]) h[v] = K(r[f], n[v]), f--, v--;
    else if (l[p] === o[v]) h[v] = K(r[p], n[v]), oe(e, h[v + 1], r[p]), p++, v--;
    else if (l[f] === o[g]) h[g] = K(r[f], n[g]), oe(e, r[p], r[f]), f--, g++;
    else if (_ === void 0 && (_ = Xe(o, g, v), u = Xe(l, p, f)), _.has(l[p])) if (_.has(l[f])) {
      const I = u.get(o[g]), we = I !== void 0 ? r[I] : null;
      if (we === null) {
        const ze = oe(e, r[p]);
        K(ze, n[g]), h[g] = ze;
      } else h[g] = K(we, n[g]), oe(e, r[p], we), r[I] = null;
      g++;
    } else ke(r[f]), f--;
    else ke(r[p]), p++;
    for (; g <= v; ) {
      const I = oe(e, h[v + 1]);
      K(I, n[g]), h[g++] = I;
    }
    for (; p <= f; ) {
      const I = r[p++];
      I !== null && ke(I);
    }
    return this.ut = o, Yt(e, h), q;
  }
}), Zt = [
  "entry_required",
  "entry_not_found",
  "emby_unreachable",
  "emby_auth_failed",
  "not_found",
  "session_not_found",
  "not_controllable",
  "unsupported_command"
];
class Je extends Error {
  constructor(t, i) {
    super(i), this.name = "EmbyApiError", this.code = t;
  }
}
function C(e) {
  if (e instanceof Je) return e;
  const t = e ?? {}, i = Zt.find((s) => s === t.code) ?? "unknown";
  return new Je(i, typeof t.message == "string" ? t.message : String(e));
}
class ve {
  constructor(t, i) {
    this.hass = t, this.entryId = i;
  }
  async send(t, i = {}) {
    const s = { type: `emby_library/${t}` };
    this.entryId !== void 0 && t !== "entries" && (s.entry_id = this.entryId);
    for (const [r, n] of Object.entries(i))
      n != null && (s[r] = n);
    try {
      return await this.hass.connection.sendMessagePromise(s);
    } catch (r) {
      throw C(r);
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
  async play(t, i, s) {
    return (await this.send("play", {
      session_id: t,
      item_id: i,
      mode: s
    })).played_item_id;
  }
  async control(t, i, s) {
    await this.send("control", { session_id: t, command: i, value: s });
  }
  async subscribeSessions(t) {
    const i = { type: "emby_library/sessions/subscribe" };
    this.entryId !== void 0 && (i.entry_id = this.entryId);
    try {
      const s = await this.hass.connection.subscribeMessage(
        t,
        i
      );
      return () => {
        Promise.resolve(s()).catch(() => {
        });
      };
    } catch (s) {
      throw C(s);
    }
  }
}
function j(e, t, i) {
  e.dispatchEvent(new CustomEvent(t, { detail: i, bubbles: !0, composed: !0 }));
}
const Pe = {
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
  "editor.default_target": "Preferred client",
  "editor.targets_hint": "Clients that must be woken first (targets with wake_action) are edited in YAML."
}, Qe = {
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
  "editor.default_target": "Foretrukket klient",
  "editor.targets_hint": "Klienter som må vekkes først (targets med wake_action) redigeres i YAML."
}, et = { en: Pe, nb: Qe, no: Qe };
function dt(e) {
  return e?.locale?.language ?? e?.language ?? "en";
}
function E(e, t, i = {}) {
  const s = e.toLowerCase();
  let n = (et[s] ?? et[s.split("-")[0] ?? ""] ?? Pe)[t] ?? Pe[t] ?? t;
  for (const [o, l] of Object.entries(i))
    n = n.replaceAll(`{${o}}`, String(l));
  return n;
}
const R = P`
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
function Xt(e, t) {
  const { poster: i, still: s, backdrop: r } = e.images;
  return t === "poster" ? i ?? null : s ?? r ?? null;
}
function tt(e, t = "h", i = "min") {
  if (e == null || !Number.isFinite(e) || e <= 0)
    return "";
  const s = Math.max(1, Math.round(e / 60)), r = Math.floor(s / 60), n = s % 60;
  return r === 0 ? `${n} ${i}` : n === 0 ? `${r} ${t}` : `${r} ${t} ${n} ${i}`;
}
function Se(e) {
  if (e == null || !Number.isFinite(e) || e < 0)
    return "0:00";
  const t = Math.floor(e), i = Math.floor(t / 3600), s = Math.floor(t % 3600 / 60), r = t % 60, n = String(r).padStart(2, "0");
  return i > 0 ? `${i}:${String(s).padStart(2, "0")}:${n}` : `${s}:${n}`;
}
function pt(e) {
  return e.season_number === null || e.episode_number === null ? "" : `S${e.season_number}E${e.episode_number}`;
}
function Oe(e) {
  const t = pt(e);
  return t ? `${t} · ${e.name}` : e.name;
}
function Jt(e) {
  return e.type === "Episode" ? e.series_name ? { title: e.series_name, subtitle: Oe(e) } : { title: Oe(e), subtitle: "" } : { title: e.name, subtitle: e.year !== null ? String(e.year) : "" };
}
function Qt(e, t) {
  const i = e.position_s ?? 0;
  if (e.state !== "playing") return i;
  const s = i + Math.max(0, t) / 1e3;
  return e.duration_s !== null ? Math.min(s, e.duration_s) : s;
}
function ei(e, t) {
  return e === null || t === null || t <= 0 ? 0 : Math.min(1, Math.max(0, e / t));
}
const it = (e) => `emby-library-card:target:${e}`;
function ti(e, t, i, s) {
  const r = i.filter((l) => l.controllable), n = (l) => l !== null && (r.some((h) => h.device_id === l) || s.some((h) => h.device_id === l));
  return n(e) ? e : n(t) ? t : new Set(r.map((l) => l.device_id)).size === 1 && r.length === 1 ? r[0].device_id : null;
}
function st(e, t) {
  return e === null ? null : t.find((i) => i.controllable && i.device_id === e) ?? null;
}
function ii(e) {
  return {
    movies: e.filter((t) => t.type === "Movie" || t.type === "Video"),
    series: e.filter((t) => t.type === "Series"),
    episodes: e.filter((t) => t.type === "Episode")
  };
}
function si(e, t, i, s) {
  const r = Math.max(1, s);
  if (t - e <= i) return e;
  const n = t - e - i;
  return e + Math.ceil(n / r) * r;
}
var ri = Object.defineProperty, ni = Object.getOwnPropertyDescriptor, Y = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ni(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (s ? o(t, i, r) : o(r)) || r);
  return s && r && ri(t, i, r), r;
};
let D = class extends S {
  constructor() {
    super(...arguments), this.language = "en", this.sessions = [], this.receivedAt = 0, this._now = Date.now(), this._expanded = null, this._dragging = null;
  }
  _t(e, t) {
    return E(this.language, e, t);
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
    j(this, "emby-control", { sessionId: e.session_id, command: t, value: i });
  }
  _toggle(e) {
    this._expanded = this._expanded === e.session_id ? null : e.session_id;
  }
  render() {
    const e = this.sessions.filter(
      (t) => t.state !== "idle" && t.now_playing !== null
    );
    return e.length === 0 ? c : a`
      <section aria-label=${this._t("np.title")}>
        ${ie(
      e,
      (t) => t.session_id,
      (t) => this._renderSession(t)
    )}
      </section>
    `;
  }
  _renderSession(e) {
    const t = e.now_playing, i = (u) => e.supported_commands.includes(u), s = this._expanded === e.session_id, r = Qt(e, this._now - this.receivedAt), n = t.images.still ?? t.images.poster, o = t.type === "Episode" && t.series_name ? t.series_name : t.name, l = t.type === "Episode" ? Oe(t) : "", h = e.state === "playing", _ = h ? i("pause") ? "pause" : i("play_pause") ? "play_pause" : null : i("play") ? "play" : i("play_pause") ? "play_pause" : null;
    return a`
      <div class="session">
        <div class="strip">
          <button
            class="summary"
            aria-expanded=${s ? "true" : "false"}
            aria-label=${this._t(s ? "np.collapse" : "np.expand", {
      device: e.device_name
    })}
            @click=${() => this._toggle(e)}
          >
            <span class="thumb">
              ${n ? a`<img
                    src=${n}
                    alt=${t.name}
                    decoding="async"
                    @error=${(u) => u.target.remove()}
                  />` : a`<ha-icon icon="mdi:play-box-outline"></ha-icon>`}
            </span>
            <span class="text">
              <span class="title">${o}</span>
              <span class="muted small">
                ${l ? a`${l} · ` : c}${e.device_name}
              </span>
            </span>
          </button>
          <div class="buttons">
            ${i("previous") ? this._button(
      "mdi:skip-previous",
      "np.previous",
      () => this._send(e, "previous")
    ) : c}
            ${_ ? this._button(
      h ? "mdi:pause" : "mdi:play",
      h ? "np.pause" : "np.play",
      () => this._send(e, _)
    ) : c}
            ${i("next") ? this._button("mdi:skip-next", "np.next", () => this._send(e, "next")) : c}
            ${i("stop") ? this._button("mdi:stop", "np.stop", () => this._send(e, "stop")) : c}
          </div>
        </div>
        <div class="bar" aria-hidden="true">
          <div style="width:${(ei(r, e.duration_s) * 100).toFixed(2)}%"></div>
        </div>
        ${s ? this._renderControls(e, r) : c}
      </div>
    `;
  }
  _button(e, t, i) {
    return a`<button class="icon-button" aria-label=${this._t(t)} @click=${i}>
      <ha-icon icon=${e}></ha-icon>
    </button>`;
  }
  _renderControls(e, t) {
    const i = (u) => e.supported_commands.includes(u), s = `seek:${e.session_id}`, r = `volume:${e.session_id}`, n = (u, p) => this._dragging?.key === u ? this._dragging.value : p, o = e.duration_s ?? 0, l = n(s, t), h = e.can_seek && i("seek") && o > 0, _ = e.muted ? i("unmute") ? "unmute" : null : i("mute") ? "mute" : null;
    return a`
      <div class="controls">
        <div class="line">
          <span class="time">${Se(l)}</span>
          ${h ? a`<input
                type="range"
                min="0"
                max=${o}
                step="1"
                .value=${String(Math.floor(l))}
                aria-label=${this._t("np.seek")}
                aria-valuetext=${Se(l)}
                @input=${(u) => this._drag(s, u)}
                @change=${(u) => this._commit(e, "seek", u)}
              />` : a`<span class="flex"></span>`}
          ${o > 0 ? a`<span class="time">${Se(o)}</span>` : c}
        </div>
        ${i("set_volume") || _ ? a`<div class="line">
              ${_ ? this._button(
      e.muted ? "mdi:volume-off" : "mdi:volume-high",
      e.muted ? "np.unmute" : "np.mute",
      () => this._send(e, _)
    ) : a`<ha-icon class="pad" icon="mdi:volume-high"></ha-icon>`}
              ${i("set_volume") ? a`<input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    .value=${String(n(r, e.volume ?? 100))}
                    aria-label=${this._t("np.volume")}
                    @input=${(u) => this._drag(r, u)}
                    @change=${(u) => this._commit(e, "set_volume", u)}
                  />` : c}
            </div>` : c}
      </div>
    `;
  }
  _drag(e, t) {
    this._dragging = { key: e, value: Number(t.target.value) };
  }
  _commit(e, t, i) {
    const s = Number(i.target.value);
    this._send(e, t, s), setTimeout(() => this._dragging = null, 2500);
  }
};
D.styles = [
  R,
  P`
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
Y([
  m()
], D.prototype, "language", 2);
Y([
  m({ attribute: !1 })
], D.prototype, "sessions", 2);
Y([
  m({ type: Number })
], D.prototype, "receivedAt", 2);
Y([
  d()
], D.prototype, "_now", 2);
Y([
  d()
], D.prototype, "_expanded", 2);
Y([
  d()
], D.prototype, "_dragging", 2);
D = Y([
  T("emby-library-now-playing")
], D);
var oi = Object.defineProperty, ai = Object.getOwnPropertyDescriptor, se = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ai(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (s ? o(t, i, r) : o(r)) || r);
  return s && r && oi(t, i, r), r;
};
let L = class extends S {
  constructor() {
    super(...arguments), this.language = "en", this.sessions = [], this.targets = [], this.selectedDeviceId = null;
  }
  _t(e, t) {
    return E(this.language, e, t);
  }
  firstUpdated() {
    const e = this._dialog;
    e && !e.open && (typeof e.showModal == "function" ? e.showModal() : e.setAttribute("open", ""));
  }
  _close() {
    j(this, "emby-close");
  }
  _onCancel(e) {
    e.preventDefault(), this._close();
  }
  _onBackdrop(e) {
    e.target === this._dialog && this._close();
  }
  _choose(e) {
    j(this, "emby-target-chosen", e);
  }
  render() {
    const e = this.sessions.filter((r) => r.controllable), t = new Set(e.map((r) => r.device_id)), i = this.targets.filter((r) => !t.has(r.device_id)), s = new Map(this.targets.map((r) => [r.device_id, r.name]));
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
      (r) => this._renderRow(
        s.get(r.device_id) ?? r.device_name,
        r.now_playing ? `${r.client} · ${this._t("target.playing", {
          title: r.now_playing.name
        })}` : r.client,
        "mdi:television",
        r.device_id === this.selectedDeviceId,
        !1,
        () => this._choose({ kind: "session", session: r })
      )
    )}
                  ${i.map(
      (r) => this._renderRow(
        r.name,
        this._t("target.offline"),
        "mdi:power-sleep",
        r.device_id === this.selectedDeviceId,
        r.wake_action === void 0,
        () => this._choose({ kind: "target", target: r })
      )
    )}
                </ul>`}
        </div>
      </dialog>
    `;
  }
  _renderRow(e, t, i, s, r, n) {
    return a`
      <li>
        <button class="row" ?disabled=${r} aria-current=${s ? "true" : "false"} @click=${n}>
          <ha-icon icon=${i}></ha-icon>
          <span class="text">
            <span class="name">${e}</span>
            <span class="muted small">${t}</span>
          </span>
          ${s ? a`<ha-icon
                class="check"
                icon="mdi:check"
                role="img"
                aria-label=${this._t("target.selected")}
              ></ha-icon>` : c}
        </button>
      </li>
    `;
  }
};
L.styles = [
  R,
  P`
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
se([
  m()
], L.prototype, "language", 2);
se([
  m({ attribute: !1 })
], L.prototype, "sessions", 2);
se([
  m({ attribute: !1 })
], L.prototype, "targets", 2);
se([
  m({ attribute: !1 })
], L.prototype, "selectedDeviceId", 2);
se([
  te("dialog")
], L.prototype, "_dialog", 2);
L = se([
  T("emby-library-target-picker")
], L);
const X = ["resume", "next_up", "latest", "suggestions"], ut = ["home", "library", "search"], _t = ["small", "medium", "large"], li = { small: 110, medium: 150, large: 190 }, J = {
  start_view: "home",
  shelves: [...X],
  shelf_limit: 20,
  show_now_playing: !0,
  show_search: !0,
  poster_size: "medium",
  height: "auto",
  default_target: null,
  targets: []
}, hi = ["type", "view_layout", "layout_options", "grid_options", "visibility"], ci = [...hi, "entry", ...Object.keys(J)], le = (e) => typeof e == "object" && e !== null && !Array.isArray(e);
function Ee(e, t, i) {
  if (typeof t != "string" || !i.includes(t))
    throw new Error(`"${e}" must be one of: ${i.join(", ")}`);
  return t;
}
function rt(e, t) {
  if (typeof t != "boolean") throw new Error(`"${e}" must be true or false`);
  return t;
}
function di(e, t) {
  if (!le(t)) throw new Error(`"${e}" must be an action`);
  const i = t.action ?? t.service;
  if (typeof i != "string" || !/^[a-z0-9_]+\.[a-z0-9_]+$/.test(i))
    throw new Error(`"${e}.action" must be an action such as script.turn_on`);
  const s = { action: i };
  if (t.target !== void 0) {
    if (!le(t.target)) throw new Error(`"${e}.target" must be a mapping`);
    s.target = t.target;
  }
  if (t.data !== void 0) {
    if (!le(t.data)) throw new Error(`"${e}.data" must be a mapping`);
    s.data = t.data;
  }
  return s;
}
function pi(e) {
  if (!Array.isArray(e)) throw new Error('"targets" must be a list');
  return e.map((t, i) => {
    const s = `targets[${i}]`;
    if (!le(t)) throw new Error(`"${s}" must be a mapping`);
    for (const n of Object.keys(t))
      if (!["name", "device_id", "wake_action"].includes(n))
        throw new Error(`Unknown field "${s}.${n}"`);
    if (typeof t.name != "string" || !t.name)
      throw new Error(`"${s}.name" is required`);
    if (typeof t.device_id != "string" || !t.device_id)
      throw new Error(`"${s}.device_id" is required`);
    const r = { name: t.name, device_id: t.device_id };
    return t.wake_action !== void 0 && (r.wake_action = di(`${s}.wake_action`, t.wake_action)), r;
  });
}
function mt(e) {
  if (!le(e)) throw new Error("Invalid configuration");
  for (const i of Object.keys(e))
    if (!ci.includes(i)) throw new Error(`Unknown field "${i}"`);
  const t = {
    type: typeof e.type == "string" ? e.type : "custom:emby-library-card",
    ...J,
    shelves: [...J.shelves],
    targets: []
  };
  if (e.entry !== void 0 && e.entry !== null && e.entry !== "") {
    if (typeof e.entry != "string") throw new Error('"entry" must be a config entry ID');
    t.entry = e.entry;
  }
  if (e.start_view !== void 0 && (t.start_view = Ee("start_view", e.start_view, ut)), e.shelves !== void 0) {
    if (!Array.isArray(e.shelves)) throw new Error('"shelves" must be a list');
    const i = e.shelves.map((s) => Ee("shelves", s, X));
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
  if (e.show_now_playing !== void 0 && (t.show_now_playing = rt("show_now_playing", e.show_now_playing)), e.show_search !== void 0 && (t.show_search = rt("show_search", e.show_search)), e.poster_size !== void 0 && (t.poster_size = Ee("poster_size", e.poster_size, _t)), e.height !== void 0 && e.height !== "auto") {
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
  if (e.targets !== void 0 && e.targets !== null && (t.targets = pi(e.targets)), t.start_view === "search" && !t.show_search)
    throw new Error('"start_view: search" requires "show_search: true"');
  return t;
}
const ui = 200;
function _i(e, t) {
  const i = Number(e.height) || 0, s = e.shelves.filter((l) => X.includes(l)), r = s.length === X.length && s.every((l, h) => l === X[h]), n = {
    entry: e.entry || void 0,
    start_view: e.start_view === J.start_view ? void 0 : e.start_view,
    shelves: r ? void 0 : s,
    shelf_limit: e.shelf_limit === J.shelf_limit ? void 0 : e.shelf_limit,
    poster_size: e.poster_size === J.poster_size ? void 0 : e.poster_size,
    height: i <= 0 ? void 0 : Math.max(ui, Math.round(i)),
    show_now_playing: e.show_now_playing ? void 0 : !1,
    show_search: e.show_search ? void 0 : !1,
    default_target: e.default_target || void 0
  }, o = Object.fromEntries(Object.entries(t).filter(([l]) => !(l in n)));
  for (const [l, h] of Object.entries(n))
    h !== void 0 && (o[l] = h);
  return o;
}
function mi(e) {
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
var gi = Object.defineProperty, fi = Object.getOwnPropertyDescriptor, G = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? fi(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (s ? o(t, i, r) : o(r)) || r);
  return s && r && gi(t, i, r), r;
};
async function yi() {
  if (customElements.get("ha-form")) return;
  const e = window.loadCardHelpers;
  if (e)
    try {
      await (await e()).createCardElement?.({ type: "entities", entities: [] })?.constructor.getConfigElement?.();
    } catch {
    }
}
let N = class extends S {
  constructor() {
    super(...arguments), this._raw = {}, this._entries = [], this._sessions = [], this._lang = "en", this._formReady = customElements.get("ha-form") !== void 0;
  }
  setConfig(e) {
    this._config = mt(e), this._raw = e, this._loadChoices();
  }
  set hass(e) {
    const t = this._hass === void 0;
    this._hass = e, this._lang = dt(e), t && this._loadChoices();
  }
  get hass() {
    return this._hass;
  }
  connectedCallback() {
    super.connectedCallback(), this._formReady || yi().then(() => customElements.whenDefined("ha-form")).then(() => this._formReady = !0);
  }
  /** Load the users and the clients that are online right now, once per entry. */
  async _loadChoices() {
    const e = this._hass, t = this._config;
    if (!e || !t) return;
    const i = t.entry ?? "";
    if (this._loadedFor === i) return;
    this._loadedFor = i;
    try {
      this._entries = await new ve(e).entries();
    } catch {
      this._entries = [];
    }
    const s = t.entry ?? (this._entries.length === 1 ? this._entries[0].entry_id : null);
    if (s !== null)
      try {
        const r = { done: !1 };
        r.stop = await new ve(e, s).subscribeSessions((n) => {
          this._sessions = n.sessions, r.done = !0, r.stop?.();
        }), r.done ? r.stop() : setTimeout(() => r.stop?.(), 1e4);
      } catch {
        this._sessions = [];
      }
  }
  _t(e) {
    return E(this._lang, e);
  }
  _schema(e) {
    const t = (s, r) => ({ value: s, label: r }), i = /* @__PURE__ */ new Map();
    for (const s of e.targets) i.set(s.device_id, s.name);
    for (const s of this._sessions)
      s.controllable && !i.has(s.device_id) && i.set(s.device_id, `${s.device_name} (${s.client})`);
    return e.default_target && !i.has(e.default_target) && i.set(e.default_target, e.default_target), [
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
            options: ut.map((s) => t(s, this._t(`nav.${s}`)))
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
            options: _t.map((s) => t(s, this._t(`editor.size.${s}`)))
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
      {
        name: "default_target",
        selector: {
          select: {
            mode: "dropdown",
            custom_value: !0,
            options: [...i].map(([s, r]) => t(s, r))
          }
        }
      }
    ];
  }
  _valueChanged(e) {
    e.stopPropagation();
    const t = _i(e.detail.value, this._raw);
    t.show_search === !1 && t.start_view === "search" && delete t.start_view, this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config: t }, bubbles: !0, composed: !0 })
    );
  }
  render() {
    const e = this._config;
    return !this._hass || !e || !this._formReady ? c : a`
      <ha-form
        .hass=${this._hass}
        .data=${mi(e)}
        .schema=${this._schema(e)}
        .computeLabel=${(t) => this._t(`editor.${t.name}`)}
        @value-changed=${this._valueChanged}
      ></ha-form>
      <p>${this._t("editor.targets_hint")}</p>
    `;
  }
};
N.styles = P`
    p {
      margin: 16px 0 0;
      color: var(--secondary-text-color);
      font-size: 0.9em;
    }
  `;
G([
  d()
], N.prototype, "_raw", 2);
G([
  d()
], N.prototype, "_config", 2);
G([
  d()
], N.prototype, "_entries", 2);
G([
  d()
], N.prototype, "_sessions", 2);
G([
  d()
], N.prototype, "_lang", 2);
G([
  d()
], N.prototype, "_formReady", 2);
N = G([
  T("emby-library-card-editor")
], N);
const vi = {
  emby_unreachable: "error.unreachable",
  emby_auth_failed: "error.auth",
  entry_required: "error.entry_required",
  entry_not_found: "error.entry_not_found",
  not_found: "error.not_found",
  unsupported_command: "error.unsupported",
  session_not_found: "target.lost",
  not_controllable: "target.lost"
};
function ge(e, t) {
  return E(e, vi[t] ?? "error.generic");
}
function pe(e, t, i) {
  const s = i !== void 0 && (t === "emby_unreachable" || t === "unknown");
  return a`
    <div class="state error" role="alert">
      <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
      <div>${ge(e, t)}</div>
      ${s ? a`<button class="button" @click=${i}>
            <ha-icon icon="mdi:refresh"></ha-icon>${E(e, "error.retry")}
          </button>` : c}
    </div>
  `;
}
function ue(e, t = "mdi:movie-open-outline") {
  return a`
    <div class="state" role="status">
      <ha-icon icon=${t}></ha-icon>
      <div>${e}</div>
    </div>
  `;
}
var bi = Object.defineProperty, $i = Object.getOwnPropertyDescriptor, re = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? $i(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (s ? o(t, i, r) : o(r)) || r);
  return s && r && bi(t, i, r), r;
};
const wi = {
  Movie: "mdi:movie-outline",
  Series: "mdi:television-classic",
  Season: "mdi:television-classic",
  Episode: "mdi:television-play",
  BoxSet: "mdi:filmstrip-box-multiple",
  Folder: "mdi:folder-outline",
  Video: "mdi:video-outline"
}, gt = (e) => wi[e] ?? "mdi:video-outline";
let U = class extends S {
  constructor() {
    super(...arguments), this.shape = "poster", this.language = "en", this._failed = !1;
  }
  willUpdate(e) {
    (e.has("item") || e.has("shape")) && (this._failed = !1);
  }
  render() {
    const e = this.item, { title: t, subtitle: i } = this.caption ?? Jt(e), s = this._failed ? null : Xt(e, this.shape), r = e.progress > 0 && e.progress < 1, n = [t, i, e.played ? E(this.language, "detail.played") : ""].filter(Boolean).join(", ");
    return a`
      <button class="tile" aria-label=${n} @click=${this._open}>
        <div class="image ${this.shape}">
          ${s ? a`<img
                src=${s}
                alt=${e.name}
                loading="lazy"
                decoding="async"
                @error=${this._onError}
              />` : a`<div class="placeholder">
                <ha-icon icon=${gt(e.type)}></ha-icon>
                <span>${e.name}</span>
              </div>`}
          ${e.played ? a`<span class="badge" aria-hidden="true"
                ><ha-icon icon="mdi:check"></ha-icon
              ></span>` : e.unplayed_count ? a`<span class="badge count" aria-hidden="true">${e.unplayed_count}</span>` : c}
          ${r ? a`<div class="progress" aria-hidden="true">
                <div style="width:${Math.round(e.progress * 100)}%"></div>
              </div>` : c}
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
    j(this, "emby-open-item", { item: this.item });
  }
};
U.styles = [
  R,
  P`
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
re([
  m({ attribute: !1 })
], U.prototype, "item", 2);
re([
  m()
], U.prototype, "shape", 2);
re([
  m()
], U.prototype, "language", 2);
re([
  m({ attribute: !1 })
], U.prototype, "caption", 2);
re([
  d()
], U.prototype, "_failed", 2);
U = re([
  T("emby-library-poster")
], U);
var xi = Object.defineProperty, ki = Object.getOwnPropertyDescriptor, x = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ki(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (s ? o(t, i, r) : o(r)) || r);
  return s && r && xi(t, i, r), r;
};
let $ = class extends S {
  constructor() {
    super(...arguments), this.language = "en", this.itemId = "", this.refreshKey = 0, this._item = null, this._error = null, this._seasons = [], this._seasonId = null, this._episodes = null, this._expanded = !1, this._clamped = !1, this._posterFailed = !1, this._backdropFailed = !1, this._generation = 0;
  }
  _t(e, t) {
    return E(this.language, e, t);
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
        const s = i.find((r) => r.id === this._seasonId) ?? i.find((r) => !r.played && r.unplayed_count !== 0) ?? i[0];
        this._seasonId = s?.id ?? null, s ? await this._loadEpisodes(t.id, s.id, e) : this._episodes = [];
      } else t.type === "Season" && t.series_id && await this._loadEpisodes(t.series_id, t.id, e);
    } catch (t) {
      if (e !== this._generation) return;
      const i = C(t).code;
      i === "not_found" ? j(this, "emby-error", { code: i }) : this._error = i;
    }
  }
  async _loadEpisodes(e, t, i) {
    const s = await this.api.episodes(e, t);
    i === this._generation && (this._episodes = s);
  }
  async _selectSeason(e) {
    if (!this._item || e === this._seasonId) return;
    const t = ++this._generation;
    this._seasonId = e, this._episodes = null;
    try {
      await this._loadEpisodes(this._item.id, e, t);
    } catch (i) {
      t === this._generation && (this._error = C(i).code);
    }
  }
  _play(e) {
    this._item && j(this, "emby-play", { itemId: this._item.id, mode: e });
  }
  _open(e) {
    j(this, "emby-open-item", { item: e });
  }
  render() {
    if (this._error !== null)
      return pe(this.language, this._error, () => void this._load());
    const e = this._item;
    if (e === null) return this._renderSkeleton();
    const t = e.type === "Episode", i = this._backdropFailed ? null : e.images.backdrop ?? e.images.still, s = this._posterFailed ? null : t ? e.images.still ?? e.images.poster : e.images.poster, r = t ? pt(e) : "";
    return a`
      <div class="hero ${i ? "with-backdrop" : ""}">
        ${i ? a`<img
              class="backdrop"
              src=${i}
              alt=""
              decoding="async"
              @error=${() => this._backdropFailed = !0}
            />` : c}
        <div class="hero-content">
          <div class="poster ${t ? "still" : ""}">
            ${s ? a`<img
                  src=${s}
                  alt=${e.name}
                  decoding="async"
                  @error=${() => this._posterFailed = !0}
                />` : a`<div class="placeholder">
                  <ha-icon icon=${gt(e.type)}></ha-icon>
                </div>`}
            ${e.progress > 0 && e.progress < 1 ? a`<div class="progress" aria-hidden="true">
                  <div style="width:${Math.round(e.progress * 100)}%"></div>
                </div>` : c}
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
                </button>` : c}
            <h2>${r ? a`<span class="muted">${r} · </span>` : c}${e.name}</h2>
            ${this._renderMeta(e)}
            ${e.genres.length > 0 ? a`<div class="genres muted">${e.genres.slice(0, 4).join(" · ")}</div>` : c}
          </div>
        </div>
      </div>

      <div class="body">
        <div class="actions">${this._renderActions(e)}</div>
        ${e.overview ? a`
              <p class="overview ${this._expanded ? "expanded" : ""}">${e.overview}</p>
              ${this._clamped || this._expanded ? a`<button
                    class="more"
                    aria-expanded=${this._expanded ? "true" : "false"}
                    @click=${() => this._expanded = !this._expanded}
                  >
                    ${this._t(this._expanded ? "detail.show_less" : "detail.show_more")}
                  </button>` : c}
            ` : c}
        ${e.type === "Series" || e.type === "Season" ? this._renderEpisodes(e) : c}
      </div>
    `;
  }
  _renderMeta(e) {
    const t = [];
    e.year !== null && t.push(String(e.year));
    const i = tt(e.runtime_s, this._t("time.h"), this._t("time.min"));
    if (i && t.push(i), e.type === "Series" && e.season_count && t.push(
      e.season_count === 1 ? this._t("detail.season_count_one") : this._t("detail.season_count", { count: e.season_count })
    ), e.official_rating && t.push(a`<span class="rating-box">${e.official_rating}</span>`), e.community_rating !== null) {
      const s = e.community_rating.toFixed(1);
      t.push(
        a`<span class="stars" aria-label=${this._t("detail.rating", { rating: s })}
          ><ha-icon icon="mdi:star"></ha-icon>${s}</span
        >`
      );
    }
    return e.played ? t.push(
      a`<span class="stars"
          ><ha-icon icon="mdi:check-circle"></ha-icon>${this._t("detail.played")}</span
        >`
    ) : e.unplayed_count && t.push(this._t("detail.unplayed_count", { count: e.unplayed_count })), a`<div class="meta">${t.map((s) => a`<span>${s}</span>`)}</div>`;
  }
  _renderActions(e) {
    return e.type === "Series" || e.type === "Season" ? a`<button class="button primary" @click=${() => this._play("resume")}>
        <ha-icon icon="mdi:play"></ha-icon>${this._t("detail.play")}
      </button>` : e.type === "BoxSet" || e.type === "Folder" ? c : e.position_s > 0 ? a`
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
          </div>` : c}
      <h3>${this._t("detail.episodes")}</h3>
      ${this._episodes === null ? a`<div aria-busy="true">
            ${Array.from({ length: 4 }, () => a`<div class="skeleton episode-skel"></div>`)}
          </div>` : this._episodes.length === 0 ? a`<div class="muted" role="status">${this._t("detail.no_episodes")}</div>` : a`<div class="episodes" role="list">
              ${ie(
      this._episodes,
      (t) => t.id,
      (t) => this._renderEpisode(t)
    )}
            </div>`}
    `;
  }
  _renderEpisode(e) {
    const t = tt(e.runtime_s, this._t("time.h"), this._t("time.min")), i = e.episode_number !== null ? `${e.episode_number}. ` : "", s = e.images.still;
    return a`
      <div role="listitem">
        <button class="episode" @click=${() => this._open(e)}>
          <span class="thumb">
            ${s ? a`<img
                  src=${s}
                  alt=${e.name}
                  loading="lazy"
                  decoding="async"
                  @error=${(r) => r.target.remove()}
                />` : c}
            <ha-icon class="thumb-icon" icon="mdi:television-play"></ha-icon>
            ${e.progress > 0 && e.progress < 1 ? a`<span class="progress" aria-hidden="true"
                  ><span style="width:${Math.round(e.progress * 100)}%"></span
                ></span>` : c}
          </span>
          <span class="episode-text">
            <span class="episode-title">${i}${e.name}</span>
            ${t ? a`<span class="muted small">${t}</span>` : c}
          </span>
          ${e.played ? a`<ha-icon
                class="seen"
                icon="mdi:check-circle"
                role="img"
                aria-label=${this._t("detail.played")}
              ></ha-icon>` : c}
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
$.styles = [
  R,
  P`
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
x([
  m({ attribute: !1 })
], $.prototype, "api", 2);
x([
  m()
], $.prototype, "language", 2);
x([
  m()
], $.prototype, "itemId", 2);
x([
  m({ type: Number })
], $.prototype, "refreshKey", 2);
x([
  d()
], $.prototype, "_item", 2);
x([
  d()
], $.prototype, "_error", 2);
x([
  d()
], $.prototype, "_seasons", 2);
x([
  d()
], $.prototype, "_seasonId", 2);
x([
  d()
], $.prototype, "_episodes", 2);
x([
  d()
], $.prototype, "_expanded", 2);
x([
  d()
], $.prototype, "_clamped", 2);
x([
  d()
], $.prototype, "_posterFailed", 2);
x([
  d()
], $.prototype, "_backdropFailed", 2);
x([
  te(".overview")
], $.prototype, "_overview", 2);
$ = x([
  T("emby-library-detail")
], $);
var Si = Object.defineProperty, Ei = Object.getOwnPropertyDescriptor, _e = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Ei(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (s ? o(t, i, r) : o(r)) || r);
  return s && r && Si(t, i, r), r;
};
const Ai = 8;
let W = class extends S {
  constructor() {
    super(...arguments), this.heading = "", this.items = null, this.shape = "poster", this.language = "en";
  }
  render() {
    return a`
      <section aria-label=${this.heading}>
        <h3>${this.heading}</h3>
        <div
          class="row ${this.shape}"
          role="list"
          aria-busy=${this.items === null ? "true" : "false"}
          @wheel=${this._onWheel}
        >
          ${this.items === null ? Array.from(
      { length: Ai },
      () => a`<div class="cell" aria-hidden="true">
                  <div class="skeleton image"></div>
                  <div class="skeleton line"></div>
                </div>`
    ) : ie(
      this.items,
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
  /** Let a vertical mouse wheel scroll the row while it can still move. */
  _onWheel(e) {
    if (e.ctrlKey || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
    const t = e.currentTarget, i = t.scrollWidth - t.clientWidth;
    if (i <= 0) return;
    const s = t.scrollLeft <= 0 && e.deltaY < 0, r = t.scrollLeft >= i - 1 && e.deltaY > 0;
    s || r || (e.preventDefault(), t.scrollLeft += e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY);
  }
};
W.styles = [
  R,
  P`
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
_e([
  m()
], W.prototype, "heading", 2);
_e([
  m({ attribute: !1 })
], W.prototype, "items", 2);
_e([
  m()
], W.prototype, "shape", 2);
_e([
  m()
], W.prototype, "language", 2);
W = _e([
  T("emby-library-shelf")
], W);
var Ci = Object.defineProperty, Pi = Object.getOwnPropertyDescriptor, H = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Pi(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (s ? o(t, i, r) : o(r)) || r);
  return s && r && Ci(t, i, r), r;
};
const Oi = {
  resume: "shelf.resume",
  next_up: "shelf.next_up",
  latest: "shelf.latest",
  suggestions: "shelf.suggestions"
};
let O = class extends S {
  constructor() {
    super(...arguments), this.language = "en", this.shelves = [], this.limit = 20, this.refreshKey = 0, this._rows = {}, this._error = null, this._generation = 0;
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
    let s = 0, r = "unknown";
    const n = this.shelves.map(async (o) => {
      let l;
      try {
        const h = await this.api.shelf(o, this.limit);
        l = h.length > 0 ? h : "hidden";
      } catch (h) {
        s += 1, r = C(h).code, l = "hidden";
      }
      t === this._generation && (this._rows = { ...this._rows, [o]: l });
    });
    Promise.all(n).then(() => {
      t === this._generation && this.shelves.length > 0 && s === this.shelves.length && (this._error = r);
    });
  }
  render() {
    if (this._error !== null) return pe(this.language, this._error, () => this._load(!1));
    const e = this.shelves.filter((t) => this._rows[t] !== "hidden");
    return e.length === 0 ? ue(E(this.language, "home.empty")) : a`
      ${e.map((t) => {
      const i = this._rows[t];
      return i === void 0 ? c : a`<emby-library-shelf
          .heading=${E(this.language, Oi[t])}
          .items=${i === "loading" ? null : i}
          .shape=${t === "resume" ? "still" : "poster"}
          .language=${this.language}
        ></emby-library-shelf>`;
    })}
    `;
  }
};
O.styles = [
  R,
  P`
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
  m({ attribute: !1 })
], O.prototype, "api", 2);
H([
  m()
], O.prototype, "language", 2);
H([
  m({ attribute: !1 })
], O.prototype, "shelves", 2);
H([
  m({ type: Number })
], O.prototype, "limit", 2);
H([
  m({ type: Number })
], O.prototype, "refreshKey", 2);
H([
  d()
], O.prototype, "_rows", 2);
H([
  d()
], O.prototype, "_error", 2);
O = H([
  T("emby-library-home")
], O);
var Ti = Object.defineProperty, Mi = Object.getOwnPropertyDescriptor, b = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Mi(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (s ? o(t, i, r) : o(r)) || r);
  return s && r && Ti(t, i, r), r;
};
const Ii = 60, Ae = 600, Di = 120, Ni = 240, Ri = [
  "SortName",
  "DateCreated",
  "PremiereDate",
  "CommunityRating",
  "DatePlayed"
], zi = {
  movies: "mdi:movie-outline",
  tvshows: "mdi:television-classic",
  boxsets: "mdi:filmstrip-box-multiple",
  mixed: "mdi:folder-play-outline"
};
let y = class extends S {
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
      e === this._generation && (this._error = C(t).code);
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
        limit: Ii,
        filter: this._unplayed ? "unplayed" : void 0
      });
      if (e !== this._generation) return;
      this._items = [...this._items, ...t.items], this._total = t.items.length === 0 ? this._items.length : t.total, this._setWindow(
        si(this._windowStart, this._items.length, Ae, this._columns())
      );
    } catch (t) {
      e === this._generation && (this._error = C(t).code);
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
        this._windowStart + Ae < this._items.length ? this._setWindow(this._windowStart + Math.ceil(Di / i) * i) : this._loadMore();
      else if (t.target === this._spacerElement && this._windowStart > 0) {
        const s = this._rowHeight();
        if (s <= 0) continue;
        const r = Math.max(0, t.intersectionRect.top - t.boundingClientRect.top), n = Math.ceil(Ni / i), o = Math.floor(r / s) - n;
        this._setWindow(Math.min(Math.max(0, o * i), this._windowStart - i));
      }
    }
  }
  _openView(e) {
    j(this, "emby-open-item", {
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
    return this._error !== null ? pe(this.language, this._error, () => this._reload()) : this._views === null ? a`<div class="views" aria-busy="true">
        ${Array.from({ length: 4 }, () => a`<div class="skeleton view"></div>`)}
      </div>` : this._views.length === 0 ? ue(E(this.language, "library.no_views"), "mdi:folder-off-outline") : a`
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
                    />` : c}
                <span class="view-label">
                  <ha-icon icon=${zi[e.collection_type]}></ha-icon>
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
    const e = (r, n) => E(this.language, r, n), t = this._items.slice(this._windowStart, this._windowStart + Ae), i = this._loading && this._items.length === 0, s = !this._loading && this._error === null && this._items.length === 0;
    return a`
      <div class="toolbar">
        <label class="sort">
          <span class="sr-only">${e("library.sort")}</span>
          <select @change=${this._setSort} .value=${this._sortBy}>
            ${Ri.map(
      (r) => a`<option value=${r} ?selected=${r === this._sortBy}>
                  ${e(`sort.${r}`)}
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
        ${this._total !== null && this._total > 0 ? a`<span class="count muted">${e("library.count", { count: this._total })}</span>` : c}
      </div>

      ${s ? ue(e(this._unplayed ? "library.empty_unplayed" : "library.empty")) : a`
            <div class="spacer" style="height:${this._spacer}px"></div>
            <div class="grid" role="list" aria-busy=${this._loading ? "true" : "false"}>
              ${ie(
      t,
      (r) => r.id,
      (r) => a`<emby-library-poster
                    role="listitem"
                    .item=${r}
                    .language=${this.language}
                  ></emby-library-poster>`
    )}
              ${i ? Array.from(
      { length: 18 },
      () => a`<div aria-hidden="true">
                      <div class="skeleton poster"></div>
                      <div class="skeleton line"></div>
                    </div>`
    ) : c}
            </div>
          `}
      ${this._error !== null ? pe(this.language, this._error, () => {
      this._error = null, this._loadMore();
    }) : c}
      ${this._loading && this._items.length > 0 ? a`<div class="more muted" role="status">${e("library.loading_more")}…</div>` : c}
      <div class="sentinel bottom"></div>
    `;
  }
};
y.styles = [
  R,
  P`
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
b([
  m({ attribute: !1 })
], y.prototype, "api", 2);
b([
  m()
], y.prototype, "language", 2);
b([
  m({ attribute: !1 })
], y.prototype, "parent", 2);
b([
  m({ type: Number })
], y.prototype, "refreshKey", 2);
b([
  d()
], y.prototype, "_views", 2);
b([
  d()
], y.prototype, "_items", 2);
b([
  d()
], y.prototype, "_total", 2);
b([
  d()
], y.prototype, "_loading", 2);
b([
  d()
], y.prototype, "_error", 2);
b([
  d()
], y.prototype, "_sortBy", 2);
b([
  d()
], y.prototype, "_sortOrder", 2);
b([
  d()
], y.prototype, "_unplayed", 2);
b([
  d()
], y.prototype, "_windowStart", 2);
b([
  d()
], y.prototype, "_spacer", 2);
b([
  te(".grid")
], y.prototype, "_grid", 2);
b([
  te(".sentinel.bottom")
], y.prototype, "_bottom", 2);
b([
  te(".spacer")
], y.prototype, "_spacerElement", 2);
y = b([
  T("emby-library-library")
], y);
var ji = Object.defineProperty, Li = Object.getOwnPropertyDescriptor, M = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Li(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (s ? o(t, i, r) : o(r)) || r);
  return s && r && ji(t, i, r), r;
};
const Ui = 300, Ce = 2;
let A = class extends S {
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
    if (this._term = e.target.value, clearTimeout(this._timer), this._sequence += 1, this._term.trim().length < Ce) {
      this._results = null, this._loading = !1, this._error = null;
      return;
    }
    this._loading = !0, this._timer = setTimeout(() => this._run(), Ui);
  }
  _run() {
    const e = this._term.trim();
    if (e.length < Ce) return;
    const t = ++this._sequence;
    this._loading = !0, this._error = null, this.api.search(e).then((i) => {
      t === this._sequence && (this._results = i, this._searched = e, this._loading = !1);
    }).catch((i) => {
      t === this._sequence && (this._error = C(i).code, this._loading = !1);
    });
  }
  _clear() {
    clearTimeout(this._timer), this._sequence += 1, this._term = "", this._results = null, this._loading = !1, this._error = null, this.focusInput();
  }
  render() {
    const e = (t, i) => E(this.language, t, i);
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
            </button>` : c}
      </div>
      <div aria-live="polite">${this._renderBody(e)}</div>
    `;
  }
  _renderBody(e) {
    if (this._error !== null) return pe(this.language, this._error, () => this._run());
    if (this._term.trim().length < Ce)
      return ue(e("search.hint"), "mdi:magnify");
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
      return ue(e("search.empty", { term: this._searched }), "mdi:magnify-close");
    const t = ii(this._results);
    return a`
      ${this._renderGroup(e("search.movies"), t.movies, "poster")}
      ${this._renderGroup(e("search.series"), t.series, "poster")}
      ${this._renderGroup(e("search.episodes"), t.episodes, "still")}
    `;
  }
  _renderGroup(e, t, i) {
    return t.length === 0 ? c : a`
      <section aria-label=${e}>
        <h3>${e}</h3>
        <div class="grid ${i}" role="list">
          ${ie(
      t,
      (s) => s.id,
      (s) => a`<emby-library-poster
                role="listitem"
                .item=${s}
                .shape=${i}
                .language=${this.language}
              ></emby-library-poster>`
    )}
        </div>
      </section>
    `;
  }
};
A.styles = [
  R,
  P`
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
M([
  m({ attribute: !1 })
], A.prototype, "api", 2);
M([
  m()
], A.prototype, "language", 2);
M([
  m({ type: Number })
], A.prototype, "refreshKey", 2);
M([
  d()
], A.prototype, "_term", 2);
M([
  d()
], A.prototype, "_results", 2);
M([
  d()
], A.prototype, "_searched", 2);
M([
  d()
], A.prototype, "_loading", 2);
M([
  d()
], A.prototype, "_error", 2);
M([
  te("input")
], A.prototype, "_input", 2);
A = M([
  T("emby-library-search")
], A);
var Hi = Object.defineProperty, Bi = Object.getOwnPropertyDescriptor, k = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? Bi(t, i) : t, n = e.length - 1, o; n >= 0; n--)
    (o = e[n]) && (r = (s ? o(t, i, r) : o(r)) || r);
  return s && r && Hi(t, i, r), r;
};
const Ki = "0.1.0", Fi = 6e4, Vi = 1e4, qi = 6e3, Wi = {
  home: "mdi:home-outline",
  library: "mdi:filmstrip-box-multiple",
  search: "mdi:magnify"
}, nt = {
  home: "nav.home",
  library: "nav.library",
  search: "nav.search"
};
let w = class extends S {
  constructor() {
    super(...arguments), this._lang = "en", this._entry = null, this._problem = null, this._tab = "home", this._stacks = { home: [], library: [], search: [] }, this._sessions = [], this._receivedAt = 0, this._available = !0, this._refreshKey = 0, this._picker = null, this._message = null, this._selectedDevice = null, this._generation = 0, this._nextKey = 1, this._waiters = /* @__PURE__ */ new Set(), this._scroll = /* @__PURE__ */ new Map(), this._onReady = () => {
      this._problem !== null || this._api === void 0 ? this._init() : this._refreshKey += 1;
    }, this._onPlay = (e) => {
      e.stopPropagation(), this._requestPlay(e.detail);
    }, this._onControl = (e) => {
      e.stopPropagation();
      const { sessionId: t, command: i, value: s } = e.detail;
      this._api?.control(t, i, s).catch((r) => {
        this._show(ge(this._lang, C(r).code));
      });
    }, this._onOpenItem = (e) => {
      e.stopPropagation();
      const { id: t, type: i, name: s } = e.detail.item, r = this._nextKey++;
      i === "BoxSet" || i === "Folder" ? this._push({ key: r, kind: "items", id: t, name: s }) : this._push({ key: r, kind: "detail", id: t, name: s });
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
    const t = this._config, i = mt(e);
    this._config = i, (t === void 0 || t.start_view !== i.start_view) && this._showTab(i.start_view), !i.show_search && this._tab === "search" && this._showTab("home"), t !== void 0 && t.entry !== i.entry && this._init();
  }
  set hass(e) {
    const t = this._hass;
    this._hass = e;
    const i = dt(e);
    i !== this._lang && (this._lang = i), t?.connection !== e.connection && (t?.connection.removeEventListener("ready", this._onReady), this.isConnected && (e.connection.addEventListener("ready", this._onReady), this._init()));
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
    super.connectedCallback(), this.addEventListener("emby-open-item", this._onOpenItem), this.addEventListener("emby-play", this._onPlay), this.addEventListener("emby-control", this._onControl), this.addEventListener("emby-error", this._onViewError), this._hass && (this._hass.connection.addEventListener("ready", this._onReady), this._init());
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.removeEventListener("emby-open-item", this._onOpenItem), this.removeEventListener("emby-play", this._onPlay), this.removeEventListener("emby-control", this._onControl), this.removeEventListener("emby-error", this._onViewError), this._hass?.connection.removeEventListener("ready", this._onReady), this._generation += 1, this._stopSessions(), clearTimeout(this._messageTimer), clearTimeout(this._refreshTimer), this._waiters.clear();
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
    let s;
    try {
      s = await new ve(e).entries();
    } catch {
      s = [];
    }
    if (i !== this._generation) return;
    let r, n = null;
    if (s.length === 0 ? n = "no_entry" : t.entry !== void 0 ? (r = s.find((h) => h.entry_id === t.entry), r || (n = "entry_not_found")) : s.length === 1 ? r = s[0] : n = "entry_required", this._problem = n, !r) {
      this._entry = null, this._api = void 0;
      return;
    }
    const o = this._entry?.entry_id !== r.entry_id;
    this._entry = r;
    const l = new ve(e, r.entry_id);
    this._api = l, this._selectedDevice = this._readStoredDevice(r.entry_id), o && (this._stacks = { home: [], library: [], search: [] }, this._sessions = [], this._showTab(this._tab));
    try {
      const h = await l.subscribeSessions((_) => this._onSessions(_));
      i !== this._generation ? h() : this._unsubscribe = h;
    } catch (h) {
      i === this._generation && (this._problem = C(h).code);
    }
  }
  // --- Sessions -----------------------------------------------------------
  _onSessions(e) {
    const t = this._available, i = this._sessions.some((s) => s.state !== "idle");
    this._sessions = e.sessions, this._available = e.available, this._receivedAt = Date.now(), !t && e.available && (this._refreshKey += 1), i && !e.sessions.some((s) => s.state !== "idle") && (clearTimeout(this._refreshTimer), this._refreshTimer = setTimeout(() => this._refreshKey += 1, 1500));
    for (const s of [...this._waiters])
      s.check(e.sessions) && this._waiters.delete(s);
  }
  /** Wait until the session list satisfies `find`, or give up after `timeoutMs`. */
  _waitFor(e, t) {
    const i = e(this._sessions);
    return i !== null ? Promise.resolve(i) : new Promise((s) => {
      const r = {
        check: (o) => {
          const l = e(o);
          return l === null ? !1 : (clearTimeout(n), s(l), !0);
        }
      }, n = setTimeout(() => {
        this._waiters.delete(r), s(null);
      }, t);
      this._waiters.add(r);
    });
  }
  // --- Target and playback --------------------------------------------------
  _readStoredDevice(e) {
    try {
      return localStorage.getItem(it(e));
    } catch {
      return null;
    }
  }
  _storeDevice(e) {
    if (this._selectedDevice = e, !!this._entry)
      try {
        localStorage.setItem(it(this._entry.entry_id), e);
      } catch {
      }
  }
  get _device() {
    const e = this._config;
    return e ? ti(
      this._selectedDevice,
      e.default_target,
      this._sessions,
      e.targets
    ) : null;
  }
  _deviceName(e) {
    if (e === null) return null;
    const t = this._config?.targets.find((i) => i.device_id === e);
    return t ? t.name : this._sessions.find((i) => i.device_id === e)?.device_name ?? null;
  }
  async _requestPlay(e) {
    const t = this._device, i = st(t, this._sessions);
    if (i) return this._playOn(i, e);
    const s = this._config?.targets.find(
      (r) => r.device_id === t && r.wake_action !== void 0
    );
    if (s) return this._wakeAndPlay(s, e);
    this._picker = { pending: e };
  }
  async _playOn(e, t) {
    const i = this._api;
    if (!i) return;
    const s = this._deviceName(e.device_id) ?? e.device_name;
    this._show(this._t("target.starting", { name: s }), !0);
    let r;
    try {
      r = await i.play(e.session_id, t.itemId, t.mode);
    } catch (o) {
      const l = C(o).code;
      this._show(ge(this._lang, l)), (l === "session_not_found" || l === "not_controllable") && (this._picker = { pending: t });
      return;
    }
    await this._waitFor(
      (o) => o.find(
        (l) => l.session_id === e.session_id && l.now_playing?.id === r
      ) ?? null,
      Vi
    ) ? this._show(null) : this._show(this._t("target.not_started"));
  }
  async _wakeAndPlay(e, t) {
    const i = this._hass, s = e.wake_action;
    if (!i || !s) return;
    this._show(this._t("target.waking", { name: e.name }), !0);
    const [r, n] = s.action.split(".", 2);
    try {
      await i.callService(r, n, s.data ?? {}, s.target);
    } catch {
      this._show(this._t("error.generic"));
      return;
    }
    const o = await this._waitFor(
      (l) => st(e.device_id, l),
      Fi
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
    i.kind === "session" ? (this._storeDevice(i.session.device_id), t && this._playOn(i.session, t)) : (this._storeDevice(i.target.device_id), t && this._wakeAndPlay(i.target, t));
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
    return E(this._lang, e, t);
  }
  _show(e, t = !1) {
    clearTimeout(this._messageTimer), this._message = e, e !== null && !t && (this._messageTimer = setTimeout(() => this._message = null, qi));
  }
  // --- Rendering ----------------------------------------------------------------
  render() {
    const e = this._config;
    if (!e) return c;
    const t = typeof e.height == "number", i = `--el-poster-width:${li[e.poster_size]}px;${t ? `height:${e.height}px;` : ""}`;
    if (this._problem !== null)
      return a`<ha-card style=${i}>${this._renderProblem(this._problem)}</ha-card>`;
    const s = this._api;
    return s ? a`
      <ha-card class=${t ? "fixed" : "auto"} style=${i}>
        ${this._renderHeader(e)}
        ${this._available ? c : a`<div class="banner" role="status">
              <ha-icon icon="mdi:lan-disconnect"></ha-icon>${this._t("error.unreachable")}
            </div>`}
        <div class="content">
          ${Object.keys(this._stacks).map(
      (r) => ie(
        this._stacks[r],
        (n) => n.key,
        (n, o) => a`<div
                  class="level"
                  ?hidden=${r !== this._tab || o !== this._stacks[r].length - 1}
                >
                  ${this._renderLevel(n, s, e)}
                </div>`
      )
    )}
        </div>
        ${this._message !== null ? a`<div class="toast" role="status" aria-live="polite">${this._message}</div>` : c}
        ${e.show_now_playing ? a`<emby-library-now-playing
              class="now-playing"
              .language=${this._lang}
              .sessions=${this._sessions}
              .receivedAt=${this._receivedAt}
            ></emby-library-now-playing>` : c}
        ${this._picker !== null ? a`<emby-library-target-picker
              .language=${this._lang}
              .sessions=${this._sessions}
              .targets=${e.targets}
              .selectedDeviceId=${this._device}
              @emby-target-chosen=${this._onTargetChosen}
              @emby-close=${() => this._picker = null}
            ></emby-library-target-picker>` : c}
      </ha-card>
    ` : a`<ha-card style=${i} aria-busy="true">
        <div class="boot"><div class="skeleton"></div></div>
      </ha-card>`;
  }
  _renderHeader(e) {
    const t = e.show_search ? ["home", "library", "search"] : ["home", "library"], i = this._stack, s = this._deviceName(this._device);
    return a`
      <header>
        <nav class="tabs" aria-label=${this._t("nav.views")}>
          ${t.map(
      (r) => a`<button
                class="tab"
                aria-label=${this._t(nt[r])}
                aria-current=${r === this._tab ? "page" : "false"}
                @click=${() => this._onTab(r)}
              >
                <ha-icon icon=${Wi[r]}></ha-icon>
                <span class="tab-label">${this._t(nt[r])}</span>
              </button>`
    )}
          <span class="flex"></span>
          <button
            class="icon-button ${s ? "has-target" : ""}"
            aria-label=${s ? this._t("target.current", { name: s }) : this._t("target.choose")}
            title=${s ?? this._t("target.choose")}
            @click=${() => this._picker = { pending: null }}
          >
            <ha-icon icon=${s ? "mdi:cast-connected" : "mdi:cast"}></ha-icon>
          </button>
        </nav>
        ${i.length > 1 ? a`<div class="crumbs">
              <button class="icon-button" aria-label=${this._t("nav.back")} @click=${this._back}>
                <ha-icon icon="mdi:arrow-left"></ha-icon>
              </button>
              <nav aria-label=${this._t("nav.breadcrumb")}>
                <ol>
                  ${i.map((r, n) => {
      const o = n === i.length - 1, l = this._levelName(r);
      return a`<li>
                      ${o ? a`<span aria-current="page">${l}</span>` : a`<button @click=${() => this._popTo(n + 1)}>${l}</button>
                            <ha-icon icon="mdi:chevron-right" aria-hidden="true"></ha-icon>`}
                    </li>`;
    })}
                </ol>
              </nav>
            </div>` : c}
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
      <div>${ge(this._lang, e)}</div>
      ${e === "emby_unreachable" || e === "unknown" ? a`<button class="button" @click=${() => void this._init()}>
            <ha-icon icon="mdi:refresh"></ha-icon>${this._t("error.retry")}
          </button>` : c}
      ${e === "entry_required" || e === "entry_not_found" ? a`<a class="button" href="?edit=1">${this._t("error.edit_dashboard")}</a>` : c}
    </div>`;
  }
};
w.styles = [
  R,
  P`
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
k([
  d()
], w.prototype, "_config", 2);
k([
  d()
], w.prototype, "_lang", 2);
k([
  d()
], w.prototype, "_api", 2);
k([
  d()
], w.prototype, "_entry", 2);
k([
  d()
], w.prototype, "_problem", 2);
k([
  d()
], w.prototype, "_tab", 2);
k([
  d()
], w.prototype, "_stacks", 2);
k([
  d()
], w.prototype, "_sessions", 2);
k([
  d()
], w.prototype, "_receivedAt", 2);
k([
  d()
], w.prototype, "_available", 2);
k([
  d()
], w.prototype, "_refreshKey", 2);
k([
  d()
], w.prototype, "_picker", 2);
k([
  d()
], w.prototype, "_message", 2);
k([
  d()
], w.prototype, "_selectedDevice", 2);
w = k([
  T("emby-library-card")
], w);
window.customCards = window.customCards ?? [];
window.customCards.some((e) => e.type === "emby-library-card") || window.customCards.push({
  type: "emby-library-card",
  name: "Emby Library",
  description: "Browse, search and play your Emby movies and series.",
  preview: !1
});
console.info(`%c EMBY-LIBRARY-CARD %c ${Ki} `, "font-weight:700", "");
export {
  Ki as CARD_VERSION,
  w as EmbyLibraryCard
};
