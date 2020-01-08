(function() {
	const h =
			'undefined' != typeof window && window === this
				? this
				: 'undefined' != typeof global && null != global ? global : this,
		k =
			'function' == typeof Object.defineProperties
				? Object.defineProperty
				: function(a, b, c) {
						a != Array.prototype && a != Object.prototype && (a[b] = c.value)
					}
	function l() {
		l = function() {}
		h.Symbol || (h.Symbol = m)
	}
	let n = 0
	function m(a) {
		return 'jscomp_symbol_' + (a || '') + n++
	}
	function p() {
		l()
		let a = h.Symbol.iterator
		a || (a = h.Symbol.iterator = h.Symbol('iterator'))
		'function' != typeof Array.prototype[a] &&
			k(Array.prototype, a, {
				configurable: !0,
				writable: !0,
				value: function() {
					return q(this)
				},
			})
		p = function() {}
	}
	function q(a) {
		let b = 0
		return r(function() {
			return b < a.length ? { done: !1, value: a[b++] } : { done: !0 }
		})
	}
	function r(a) {
		p()
		a = { next: a }
		a[h.Symbol.iterator] = function() {
			return this
		}
		return a
	}
	function t(a) {
		p()
		const b = a[Symbol.iterator]
		return b ? b.call(a) : q(a)
	}
	function u(a) {
		if (!(a instanceof Array)) {
			a = t(a)
			for (var b, c = []; !(b = a.next()).done; ) c.push(b.value)
			a = c
		}
		return a
	}
	let v = 0
	function w(a, b) {
		const c = XMLHttpRequest.prototype.send,
			d = v++
		XMLHttpRequest.prototype.send = function(f) {
			for (var e = [], g = 0; g < arguments.length; ++g) e[g - 0] = arguments[g]
			const E = this
			a(d)
			this.addEventListener('readystatechange', function() {
				4 === E.readyState && b(d)
			})
			return c.apply(this, e)
		}
	}
	function x(a, b) {
		const c = fetch
		fetch = function(d) {
			for (var f = [], e = 0; e < arguments.length; ++e) f[e - 0] = arguments[e]
			return new Promise(function(d, e) {
				const g = v++
				a(g)
				c.apply(null, [].concat(u(f))).then(
					function(a) {
						b(g)
						d(a)
					},
					function(a) {
						b(a)
						e(a)
					},
				)
			})
		}
	}
	const y = 'img script iframe link audio video source'.split(' ')
	function z(a, b) {
		a = t(a)
		for (let c = a.next(); !c.done; c = a.next())
			if (((c = c.value), b.includes(c.nodeName.toLowerCase()) || z(c.children, b))) return !0
		return !1
	}
	function A(a) {
		const b = new MutationObserver(function(c) {
			c = t(c)
			for (let b = c.next(); !b.done; b = c.next())
				(b = b.value),
					'childList' == b.type && z(b.addedNodes, y)
						? a(b)
						: 'attributes' == b.type && y.includes(b.target.tagName.toLowerCase()) && a(b)
		})
		b.observe(document, {
			attributes: !0,
			childList: !0,
			subtree: !0,
			attributeFilter: ['href', 'src'],
		})
		return b
	}
	function B(a, b) {
		if (2 < a.length) return performance.now()
		const c = []
		b = t(b)
		for (var d = b.next(); !d.done; d = b.next())
			(d = d.value),
				c.push({ timestamp: d.start, type: 'requestStart' }),
				c.push({ timestamp: d.end, type: 'requestEnd' })
		b = t(a)
		for (d = b.next(); !d.done; d = b.next()) c.push({ timestamp: d.value, type: 'requestStart' })
		c.sort(function(a, b) {
			return a.timestamp - b.timestamp
		})
		a = a.length
		for (b = c.length - 1; 0 <= b; b--)
			switch (((d = c[b]), d.type)) {
				case 'requestStart':
					a--
					break
				case 'requestEnd':
					a++
					if (2 < a) return d.timestamp
					break
				default:
					throw Error('Internal Error: This should never happen')
			}
		return 0
	}
	function C(a) {
		a = a ? a : {}
		this.w = !!a.useMutationObserver
		this.u = a.minValue || null
		a = window.__tti && window.__tti.e
		const b = window.__tti && window.__tti.o
		this.a = a
			? a.map(function(a) {
					return { start: a.startTime, end: a.startTime + a.duration }
				})
			: []
		b && b.disconnect()
		this.b = []
		this.f = new Map()
		this.j = null
		this.v = -Infinity
		this.i = !1
		this.h = this.c = this.s = null
		w(this.m.bind(this), this.l.bind(this))
		x(this.m.bind(this), this.l.bind(this))
		D(this)
		this.w && (this.h = A(this.B.bind(this)))
	}
	C.prototype.getFirstConsistentlyInteractive = function() {
		const a = this
		return new Promise(function(b) {
			a.s = b
			'complete' == document.readyState
				? F(a)
				: window.addEventListener('load', function() {
						F(a)
					})
		})
	}
	function F(a) {
		a.i = !0
		const b = 0 < a.a.length ? a.a[a.a.length - 1].end : 0,
			c = B(a.g, a.b)
		G(a, Math.max(c + 5e3, b))
	}
	function G(a, b) {
		!a.i ||
			a.v > b ||
			(clearTimeout(a.j),
			(a.j = setTimeout(function() {
				var b = performance.timing.navigationStart,
					d = B(a.g, a.b),
					b =
						(window.a && window.a.A ? 1e3 * window.a.A().C - b : 0) ||
						performance.timing.domContentLoadedEventEnd - b
				if (a.u) var f = a.u
				else
					performance.timing.domContentLoadedEventEnd
						? ((f = performance.timing), (f = f.domContentLoadedEventEnd - f.navigationStart))
						: (f = null)
				const e = performance.now()
				null === f && G(a, Math.max(d + 5e3, e + 1e3))
				const g = a.a
				5e3 > e - d
					? (d = null)
					: ((d = g.length ? g[g.length - 1].end : b), (d = 5e3 > e - d ? null : Math.max(d, f)))
				d &&
					(a.s(d), clearTimeout(a.j), (a.i = !1), a.c && a.c.disconnect(), a.h && a.h.disconnect())
				G(a, performance.now() + 1e3)
			}, b - performance.now())),
			(a.v = b))
	}
	function D(a) {
		a.c = new PerformanceObserver(function(b) {
			b = t(b.getEntries())
			for (let c = b.next(); !c.done; c = b.next())
				if (
					((c = c.value),
					'resource' === c.entryType &&
						(a.b.push({ start: c.fetchStart, end: c.responseEnd }), G(a, B(a.g, a.b) + 5e3)),
					'longtask' === c.entryType)
				) {
					const d = c.startTime + c.duration
					a.a.push({ start: c.startTime, end: d })
					G(a, d + 5e3)
				}
		})
		a.c.observe({ entryTypes: ['longtask', 'resource'] })
	}
	C.prototype.m = function(a) {
		this.f.set(a, performance.now())
	}
	C.prototype.l = function(a) {
		this.f.delete(a)
	}
	C.prototype.B = function() {
		G(this, performance.now() + 5e3)
	}
	h.Object.defineProperties(C.prototype, {
		g: {
			configurable: !0,
			enumerable: !0,
			get: function() {
				return [].concat(u(this.f.values()))
			},
		},
	})
	const H = {
		getFirstConsistentlyInteractive: function(a) {
			a = a ? a : {}
			return 'PerformanceLongTaskTiming' in window
				? new C(a).getFirstConsistentlyInteractive()
				: Promise.resolve(null)
		},
	}
	window.ttiPolyfill = H
})()
