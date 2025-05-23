import ICalculationStrategy from "@/misc/ICalculationStrategy";
import { Inputs, Ranges, Result, Selected } from "@/misc/types";

export default class GearCalculationModel implements ICalculationStrategy {
  getName(): string {
    return "Bánh răng";
  }

  getOptions(): Record<string, string[]> | null {
    return null;
  }

  getDefaultInput(): Inputs {
    return {
      dr1HB: "290",
      dr2HB: "275",
      NHO1: "2.44e7",
      NHO2: "2.15e7",
      NFO1: "4e6",
      NFE1: "18.9e8",
      NFE2: "6.4e8",
      KFC: "1",
      sH: "1.1",
      sF: "1.75",
      KR: "50",
      KHB: "1.1",
      v: "2.97",
      u: "3",
      m: "2.58",
      z1: "30",
      z2: "90"
    };
  }

  getDefaultSelected(): Selected | null {
    return null;
  }

  getRanges(): Ranges {
    return {
      dr1HB: { min: 100, max: 400 },
      dr2HB: { min: 100, max: 400 },
      NHO1: { min: 1e6, max: 1e8 },
      NHO2: { min: 1e6, max: 1e8 },
      NFO1: { min: 1e6, max: 1e7 },
      NFE1: { min: 1e8, max: 1e9 },
      NFE2: { min: 1e8, max: 1e9 },
      KFC: { min: 0.5, max: 1.5 },
      sH: { min: 1, max: 2 },
      sF: { min: 1, max: 3 },
      KR: { min: 10, max: 100 },
      KHB: { min: 0.2, max: 1.0 },
      v: { min: 0.1, max: 10 },
      u: { min: 1, max: 5 },
      m: { min: 0.5, max: 10 },
      z1: { min: 1, max: 100 },
      z2: { min: 1, max: 200 }
    };
  }

  calculate(inputs: Inputs, selected: Selected | null): Result {
    const result: Result = {};

    // parse inputs
    const M1 = parseFloat(inputs.dr1HB);
    const M2 = parseFloat(inputs.dr2HB);
    const NHO1 = parseFloat(inputs.NHO1);
    const NHO2 = parseFloat(inputs.NHO2);
    const NFO1 = parseFloat(inputs.NFO1);
    const NFE1 = parseFloat(inputs.NFE1);
    const NFE2 = parseFloat(inputs.NFE2);
    const KFC = parseFloat(inputs.KFC);
    const sH = parseFloat(inputs.sH);
    const sF = parseFloat(inputs.sF);
    const KR = parseFloat(inputs.KR);
    const KHB = parseFloat(inputs.KHB);
    const v = parseFloat(inputs.v);
    const u = parseFloat(inputs.u);
    const m = parseFloat(inputs.m);
    const z1 = parseFloat(inputs.z1);
    const z2 = parseFloat(inputs.z2);

    // Stress limits
    const oHlim1 = 2 * M1 + 70;
    const oHlim2 = 2 * M2 + 70;
    const oFlim1 = 1.8 * M1;
    const oFlim2 = 1.8 * M2;

    // Lifetime factors
    const KHL = Math.pow(NHO1 / NHO2, 1 / 3);
    const KFL = Math.pow(NFO1 / NFE1, 1 / 3);

    // Permissible stresses
    const oH1 = (0.9 * KHL * oHlim1) / sH;
    const oH2 = (0.9 * KHL * oHlim2) / sH;
    result.oH = Math.min(oH1, oH2);

    const oF1 = (oFlim1 * KFL * KFC) / sF;
    const oF2 = (oFlim2 * KFL * KFC) / sF;
    result.oF = Math.min(oF1, oF2);

    // Gear dimensions (simplified placeholders)
    result.oHlim1 = oHlim1;
    result.oHlim2 = oHlim2;
    result.oFlim1 = oFlim1;
    result.oFlim2 = oFlim2;
    result.KHL = KHL;
    result.KFL = KFL;

    // Example dimension calculations (replace with exact formulas as needed)
    result.de1 = m * z1;
    result.de2 = m * z2;
    result.dml1 = m * z1;
    result.dml2 = m * z2;
    result.Re = KR * Math.sqrt(u * u + 1);

    return result;
  }
}
