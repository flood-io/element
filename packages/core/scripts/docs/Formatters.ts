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
		return typeToString(this.input)
	}
}

export function typeToString(input: ParamType): string | never {
	const { type } = input

	switch (input.type) {
		case 'intrinsic':
			return `${input.name}`
		case 'stringLiteral':
			return `"${input.value}"`
		case 'array':
			return `${typeToString(input.elementType)}\\[]`
		case 'union':
			return `${input.types.map(typeToString).join(' | ')}`
		case 'reflection':
			return reflectedDeclarationToAny(input.declaration).toString()
		case 'reference':
			if (input.name === 'Promise') {
				const formattedArgs = (input.typeArguments || []).map(typeToString)
				return `[Promise]&lt;${formattedArgs.join(' | ')}&gt;`
			} else {
				return `[${input.name}]`
			}
		default:
			console.assert(true, `Found unknown type: "${type}"`)
	}
	return 'void'
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

function reflectedDeclarationToAny(
	declaration: ReflectedDeclaration | Variable | CallSignature
): any {
	switch (declaration.kindString) {
		case 'Type literal':
			if (declaration.children) {
				const children = declaration.children.map(reflectedDeclarationToAny).reduce((memo, obj) => {
					memo = { ...obj, ...memo }
					return memo
				}, {})
				return JSON.stringify(children)
			}
			break
		case 'Variable':
			const { name, type } = declaration
			const formattedType = typeToString(type)
			const obj = {}
			obj[name] = formattedType
			return obj
	}

	return 'unknown reflection type'
}

// function
// class TypeDocType {
// type: string
// toString() { return 'void' }
// }

// class UnionType extends TypeDocType {
// type: 'union',
// types: TypeDocType[]
// }

// export class TypeAliasFormatter {
// constructor(public type: TypeDocType) {}
// }
