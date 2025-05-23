import { Inputs, Ranges, Result, Selected } from "@/misc/types";

export default interface ICalculationStrategy {
    getName(): string
    getDefaultInput(): Inputs
    getDefaultSelected(): Selected | null
    getOptions(): Record<string, string[]> | null
    getRanges(): Ranges
    calculate(inputs: Inputs, selected: Selected | null): Result
}