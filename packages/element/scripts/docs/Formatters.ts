export type ParamType =
	| { type: 'intrinsic'; name: string }
	| { type: 'reference'; name: string | 'Promise'; typeArguments?: ParamType[] }
	| { type: 'stringLiteral'; value: string }
	| { type: 'reflection'; declaration: any }
	| { type: 'array'; elementType: ParamType }
	| { type: 'union'; types: ParamType[] }

export class ParamTypeFormatter {
	constructor(public input: ParamType) {}

	public toString() {
		let { type } = this.input

		switch (this.input.type) {
			case 'intrinsic':
				return `${this.input.name}`
			case 'stringLiteral':
				return this.input.value
			case 'array':
				let formatter = new ParamTypeFormatter(this.input.elementType)
				return `${formatter.toString()}[]`
			case 'union':
				let formattedArgs = this.input.types.map(t => new ParamTypeFormatter(t).toString())
				return `${formattedArgs.join('|')}`
			case 'reflection':
				return new ReflectedDeclarationFormatter(this.input.declaration).toString()
			case 'reference':
				if (this.input.name === 'Promise') {
					let formattedArgs = (this.input.typeArguments || []).map(t =>
						new ParamTypeFormatter(t).toString(),
					)
					return `[Promise]&lt;${formattedArgs.join('|')}&gt;`
				} else {
					return `[${this.input.name}]`
				}
			default:
				console.assert(true, `Found unknown type: "${type}"`)
		}
	}
}

type Variable = {
	id: string
	name: string
	kindString: 'Variable'
	flags: object
	type: ParamType
}
type CallSignature = {
	name: '__call'
	kindString: 'Call signature'
	type: ParamType
}
type ReflectedDeclaration = {
	name: '__type'
	kindString: 'Type literal'
	children?: Variable[]
	signatures?: CallSignature[]
}

class ReflectedDeclarationFormatter {
	constructor(public declaration: ReflectedDeclaration | Variable | CallSignature) {}

	toString() {
		if (this.declaration.kindString === 'Type literal') {
			if (this.declaration.children) {
				let children = this.declaration.children
					.map(child => new ReflectedDeclarationFormatter(child).toString())
					.reduce((memo, obj) => {
						memo = { ...obj, ...memo }
						return memo
					}, {})
				return JSON.stringify(children)
			}
		} else if (this.declaration.kindString === 'Variable') {
			let { name, type } = this.declaration
			let formattedType = new ParamTypeFormatter(type)
			let obj = {}
			obj[name] = formattedType.toString()
			return obj
		}
	}
}
