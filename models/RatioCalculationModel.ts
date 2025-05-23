import ICalculationStrategy from "@/misc/ICalculationStrategy";
import { Inputs, Ranges, Result, Selected } from "@/misc/types";

export default class RatioCalculationModel implements ICalculationStrategy {
    getName(): string {
        return "Tỷ số truyền"
    }
    getRanges(): Ranges {
        return {
            "ndc": {min: 0, max: Infinity},
            "n": {min: 0, max: Infinity},
            "ud": {min: 3, max: 5},
            "Kbe": {min: 0, max: Infinity},
            "Ψbd2": {min: 0, max: Infinity},
            "ck": {min: 0, max: Infinity},
            "[K01]": {min: 0, max: Infinity},
            "[K02]": {min: 0, max: Infinity},
            "Pdc": {min: 0, max: Infinity},
            "ηkn": { min: 0.99, max: 0.995 },
            "ηđt": { min: 0.95, max: 0.97 },
            "ηrc": { min: 0.96, max: 0.98 },
            "ηrt": { min: 0.95, max: 0.97 },
            "ηol": { min: 0.99, max: 0.995 },
          }
    }
    getDefaultInput(): Inputs {
        return {
            "ndc": "2925",
            "n": "70",
            "ud": "4",
            "Kbe": "0.26",
            "Ψbd2": "1.2",
            "ck": "1.1",
            "[K01]": "1",
            "[K02]": "1",
            "Pdc": "7.5",
            "ηkn": "1",
            "ηđt": "0.955",
            "ηrc": "0.96",
            "ηrt": "0.97",
            "ηol": "0.99",
          }
    }
    getDefaultSelected(): Selected | null {
        return null
    }
    getOptions(): Record<string, string[]> | null {
        return null
    }
    calculate(inputs: Inputs, selected: Selected | null): Result {
        let result: Result = {
            uch: 0,
            uh: 0,
            "λk": 0,
            ubrc: 0,
            ubrt: 0,
            Pdc: parseFloat(inputs.Pdc),
            P1: 0,
            P2: 0,
            P3: 0,
            ndc: parseFloat(inputs.ndc),
            n1: 0,
            n2: 0,
            n3: 0,
            n: 0,
            Tdc: 0,
            T1: 0,
            T2: 0,
            T3: 0,
            Ttt: 0,
          }
        result.uch = 
        parseFloat(inputs.ndc) /
        parseFloat(inputs.n)
      result.uh =
        result.uch / parseFloat(inputs.ud)
      result["λk"] = 
        2.25 * 
        parseFloat(inputs["Ψbd2"]) *
        parseFloat(inputs["[K02]"]) / (
          (1 - parseFloat(inputs["Kbe"])) *
          parseFloat(inputs["Kbe"]) *
          parseFloat(inputs["[K01]"])
        )
      result.ubrc = this.solveForU1(result["λk"], parseFloat(inputs.ck), result.uh)
      result.ubrt = result.uh / result.ubrc
      result.P1 =
        parseFloat(inputs.Pdc) *
        parseFloat(inputs["ηol"]) *
        parseFloat(inputs["ηđt"])
      result.P2 =
        result.P1 *
        parseFloat(inputs["ηol"]) *
        parseFloat(inputs["ηrc"])
      result.P3 =
        result.P2 *
        parseFloat(inputs["ηol"]) *
        parseFloat(inputs["ηđt"])
      result.n1 =
        this.toNum(result.ndc) /
        parseFloat(inputs.ud)
      result.n2 =
        result.n1 /
        result.ubrc
      result.n3 =
        result.n2 /
        result.ubrt
      result.n =
        result.n3 /
        parseFloat(inputs["ηkn"])
  
      const coefficence = 9.55 * 10e6
      result.Tdc =
          coefficence *
          this.toNum(result.Pdc) /
          this.toNum(result.ndc)
      result.T1 =
          coefficence *
          result.P1 /
          result.n1
      result.T2 =
          coefficence *
          result.P2 /
          result.n2
      result.T3 =
          coefficence *
          result.P3 /
          result.n3
      result.Ttt = result.T3
      return result
    }
    solveForU1(lambda_k: number, c_k: number, u_h: number) {
        const a = lambda_k * Math.pow(c_k, 3);
        
        function equation(u1: number) {
            return (a * Math.pow(u1, 4)) / (Math.pow(u_h, 2) * (u_h + u1)) - 1;
        }
        
        function derivative(u1: number) {
            const numerator = 4 * a * Math.pow(u1, 3) * (u_h + u1) - a * Math.pow(u1, 4);
            const denominator = Math.pow(u_h, 2) * Math.pow(u_h + u1, 2);
            return numerator / denominator;
        }
        
        function newtonRaphson(initialGuess: number, tolerance = 1e-6, maxIterations = 100) {
            let u1 = initialGuess;
            for (let i = 0; i < maxIterations; i++) {
                const fValue = equation(u1);
                const fDerivative = derivative(u1);
                if (Math.abs(fDerivative) < 1e-10) break; 
                
                const nextU1 = u1 - fValue / fDerivative;
                if (Math.abs(nextU1 - u1) < tolerance) return nextU1;
                
                u1 = nextU1;
            }
            return Infinity; 
        }
        
        return newtonRaphson(2); 
      }
      toNum(input: number | string) {
        if (typeof input === 'number') {
          return input
        }
        return parseFloat(input)
      
      }
}