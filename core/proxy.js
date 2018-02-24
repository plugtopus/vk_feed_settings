class Proxy
{
	constructor() {
		this.rules = [];
	}
	buildRule(item, isFirst){
		return `${!isFirst?`else `:``}if(${item.exp}){ return "${this.resolveHost[(item.srv)]}"; }`;
	}
	addRule(exp, srv = 'reserved_nl2') {
		this.rules.push({exp, srv});
		return this;
	}
	resolveTo(host) {
		this.resolveHost = host;
		return this;
	}
	buildPacScript(cb) {
		const s = [`function FindProxyForURL(url, host){`];
		const self = this;

		this.rules.forEach(
			(item, id) => s.push(self.buildRule(item, id===0))
		);

		s.push(' else { return "DIRECT"; } }');

		return cb(s.join(' '));
	}
}
