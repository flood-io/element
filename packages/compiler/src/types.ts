import { CompilerStats } from "./CompilerStats";
// import { Context, Script, compileFunction, createContext, runInContext } from 'vm'
export interface CompilerOutput {
	content: string;
	sourceMap?: string;
	stats?: CompilerStats;
}
