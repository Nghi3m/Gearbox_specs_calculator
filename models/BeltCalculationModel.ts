import ICalculationStrategy from "@/misc/ICalculationStrategy";
import { Inputs, Ranges, Result, Selected } from "@/misc/types";
export type Belt = {
    bt: number, 
    b: number, 
    h: number, 
    y0: number, 
    A: number, 
    d1Min: number, 
    d1Max: number,
    lMin: number,
    lMax: number
  }
  export type Belts = Record<string, Belt>
export const belts: Belts = {
  "O": { bt: 8.5, b: 10, h: 6, y0: 2.1, A: 47, d1Min: 70, d1Max: 140, lMin: 400, lMax: 2500 },
  "А": { bt: 11, b: 13, h: 8, y0: 2.8, A: 81, d1Min: 100, d1Max: 200, lMin: 560, lMax: 4000 },
  "Б": { bt: 14, b: 17, h: 10.5, y0: 4.0, A: 138, d1Min: 140, d1Max: 280, lMin: 800, lMax: 6300 },
  "В": { bt: 19, b: 22, h: 13.5, y0: 4.8, A: 230, d1Min: 200, d1Max: 400, lMin: 1800, lMax: 10600 },
  "Г": { bt: 27, b: 32, h: 19, y0: 6.9, A: 476, d1Min: 315, d1Max: 630, lMin: 3150, lMax: 15000 },
  "Д": { bt: 32, b: 38, h: 23.5, y0: 8.3, A: 692, d1Min: 500, d1Max: 1000, lMin: 4500, lMax: 18000 },
  "Е": { bt: 42, b: 50, h: 30, y0: 11, A: 1170, d1Min: 800, d1Max: 1600, lMin: 6300, lMax: 18000 },
  "УО": { bt: 8.5, b: 10, h: 8, y0: 2, A: 56, d1Min: 63, d1Max: 180, lMin: 630, lMax: 3550 },
  "УА": { bt: 11, b: 13, h: 10, y0: 2.8, A: 95, d1Min: 90, d1Max: 250, lMin: 800, lMax: 4500 },
  "УБ": { bt: 14, b: 17, h: 13, y0: 3.5, A: 158, d1Min: 140, d1Max: 200, lMin: 1250, lMax: 8000 },
  "УВ": { bt: 19, b: 22, h: 18, y0: 4.8, A: 278, d1Min: 224, d1Max: 315, lMin: 2000, lMax: 8000 },
  "...": { bt: 19, b: 22, h: 18, y0: 4.8, A: 278, d1Min: 224, d1Max: 315, lMin: 2000, lMax: 8000 }
}
export default class BeltCalculationModel implements ICalculationStrategy {
    getName(): string {
        return "Bộ truyền đai"
    }
    getOptions(): Record<string, string[]> {
        return {
            'Nhóm động cơ': ['Nhóm I', 'Nhóm II'],
            'Loại tải trọng': ['Tĩnh', 'Nhẹ', 'Mạnh', 'Va đập'],
            'Chế độ làm việc': ['1 ca', '2 ca', '3 ca']
        }
    }
    getDefaultInput(): Inputs {
        return {
            "Pdc": "7.5",
            "ndc": "2925",
            "ε": "0.02",
            "ud": "4",
            p: '1100',
            E: '100',
            'σr': '9'
        
          }
    }
    getDefaultSelected(): Selected {
        return {
            'Nhóm động cơ': 'Nhóm I',
            'Loại tải trọng': "Nhẹ",
            'Chế độ làm việc': '2 ca'
          }
    }
    getRanges(): Ranges {
        return {
            "Pdc": {min: 0, max: 400},
            "ndc": {min: 200, max: 5000},
            "ε": {min: 0.01, max: 0.02},
            "ud": {min: 3, max: 5},
            "p": {min: 0, max: Infinity},
            "E": {min: 0, max: Infinity},
            "σr": {min: 0, max: Infinity},
          }
    }
    calculate(inputs: Inputs, selected: Selected): Result {
        let result: Result = {}
        const u2a = [1.5, 1.2, 1, 0.95, 0.9, 0.85]
        result["Loại"] = this.getBellType(parseFloat(inputs.Pdc), parseFloat(inputs.ndc))
        console.log(result["Loại"])
        let bell: Belt = belts[result["Loại"]]
        result.bt = belts[result["Loại"]].bt
        result.b = bell.b
        result.h = bell.h
        result.y0 = bell.y0
        result.A = bell.A
        result.d1 = this.pickd1(bell.d1Min*1.2, bell.d1Max*1.2)
        result.v1 = Math.PI * result.d1 * parseFloat(inputs.ndc) /60000
        result.d2 = this.pickd2(result.d1 * parseFloat(inputs.ud) * (1 - parseFloat(inputs["ε"])))
        result["u'"] = result.d2 / (result.d1 * (1 - parseFloat(inputs["ε"])))
        result["Δu"] = (result["u'"] - parseFloat(inputs["ud"])) / parseFloat(inputs["ud"])
        result.asb = result.d2 * u2a[Math.floor(parseFloat(inputs.ud))-1]
        result.L = 2 * result.asb +
          (Math.PI * (result.d1 + result.d2) / 2) +
          (result.d2 - result.d1)**2 / (4 * result.asb)
        result.L = this.pickL(result.L)
        result.i = result.v1 / (result.L * 10e-4)
        result['λ'] = 
          result.L - Math.PI*(result.d1 + result.d2) / 2
        result['Δ'] =
          (result.d2 - result.d1) / 2
        result.a = 
          (result['λ'] + Math.sqrt(result['λ']**2 - 8*result['Δ']**2)) / 4
        result['α'] =
          180 - 57*(result.d2 - result.d1) / result.a
        result.Kd = this.pickKd(selected["Nhóm động cơ"], selected["Chế độ làm việc"], selected["Loại tải trọng"])
        result.P0 = this.pickP0(this.getBellType(parseFloat(inputs.Pdc), parseFloat(inputs.ndc)), result.v1, result.d1)
        result["Cα"] = this.pickCa(result["α"])
        result.L0 = this.pickl0(result["Loại"])
        result["L/L0"] = result.L/result.L0
        result.CL = this.pickCL(result.L/result.L0)
        result.Cu = this.pickCu(result["u'"])
        result["z'"] = parseFloat(inputs.Pdc)/result.P0
        result.Cz = this.pickCz(result["z'"])
        result.z = Math.ceil(
          parseFloat(inputs.Pdc)*
          result.Kd /
          result["Cα"] /
          result.CL /
          result.Cu /
          result.Cz /
          result.P0
        )
        result.H = this.pickHh0te(result["Loại"]).H
        result.h0 = this.pickHh0te(result["Loại"]).h0
        result.t = this.pickHh0te(result["Loại"]).t
        result.e = this.pickHh0te(result["Loại"]).e
        result.B = 
          (result.z - 1) *
          result.t + 2 * result.e
        result.da1 =
          result.d1 + 2 * result.h0
        result.da2 =
          result.d2 + 2 * result.h0
        result.qm = this.pickqm(result["Loại"])
        result.Fv =
          result.qm * result.v1**2
        result.F0 =
          (780 * parseFloat(inputs.Pdc) * result.Kd) /
          (result.v1 * result["Cα"] * result.z) +
          result.Fv
        result["F0'"]= 
          result.F0 * 3
        result.Ft = 
          1000 * parseFloat(inputs.Pdc) / result.v1
        result.Fr =
          2 * result.F0 * result.z * Math.sin(result['α']/180*Math.PI/2)
        result.f =
          1 / (result['α']/180*Math.PI) *
          Math.log(
            (2 * result["F0'"] + result.Ft) /
            (2 * result["F0'"] - result.Ft) 
          )
        result['σ1'] =
        (1000 * parseFloat(inputs.Pdc) * Math.E**(result.f * (result['α']/180*Math.PI))) /
        (result.A * result.z * result.v1 * (Math.E**( result.f * (result['α']/180*Math.PI) ) - 1))
        result['σv'] =
          parseFloat(inputs.p) * result.v1**2 * 1e-6
        result['σF1'] =
          2 * result.y0 * parseFloat(inputs.E) / result.d1
        result['σmax'] = 
          result['σ1'] + result['σv'] + result['σF1']
        result['Φ'] = 
          result.Ft / 2 / result["F0'"]
        result['σt'] =
          result.Ft / result.A / result.z
        result['Lh'] =
          (parseFloat(inputs['σr']) / result['σmax'])** 8 * 1e7 /
          (2 * 3600 * result.i)
        return result
    }
    pickHh0te(bellType: string) {
        const lookupTable: Record<string, Record<string, number>> =  {
          "О": { H: 10, h0: 2.5, t: 12, e: 8 },
          "А": { H: 12.5, h0: 3.3, t: 15, e: 10 },
          "Б": { H: 16, h0: 4.2, t: 19, e: 12.5 },
          "В": { H: 21, h0: 5.7, t: 25.5, e: 17 },
          "УО": { H: 12.5, h0: 2.5, t: 12, e: 8 },
          "УА": { H: 16, h0: 3, t: 15, e: 10 },
          "УБ": { H: 21, h0: 4, t: 19, e: 12.5 },
          "УВ": { H: 24, h0: 5, t: 26, e: 17 }
        }
        return lookupTable[bellType]
      }
    pickl0(bellType: string) {
        const lookupTable: Record<string, number> =   {
        О: 1320,
        А: 1700,
        Б: 2240,
        В: 3750,
        Г: 6000
        }
        return lookupTable[bellType]
      }
    pickP0(bellType: string, v1: number, d1: number) {
        const lookupTable: Record<string, Record<number, Record<number, number>>> = {
          O: {
            63: { 3: 0.33, 5: 0.49, 10: 0.83, 15: 1.04, 20: 1.14 },
            90: { 3: 0.46, 5: 0.64, 10: 1.17, 15: 1.54, 20: 1.80, 25: 1.88 },
            112: { 3: 0.48, 5: 0.75, 10: 1.33, 15: 1.78, 20: 2.12, 25: 2.30 }
          },
          А: {
            112: { 3: 0.70, 5: 1.08, 10: 1.85, 15: 2.40, 20: 2.73, 25: 2.85 },
            125: { 3: 0.78, 5: 1.17, 10: 2.00, 15: 2.75, 20: 3.08, 25: 3.26 },
            140: { 3: 0.80, 5: 1.25, 10: 2.20, 15: 2.92, 20: 3.44, 25: 3.75 },
            160: { 3: 0.84, 5: 1.32, 10: 2.34, 15: 3.14, 20: 3.78, 25: 4.09 },
            180: { 3: 0.88, 5: 1.38, 10: 2.47, 15: 3.37, 20: 4.06, 25: 4.46 }
          },
          Б: {
            125: { 3: 0.92, 5: 1.38, 10: 2.25, 15: 2.61 },
            180: { 3: 1.20, 5: 2.13, 10: 3.38, 15: 4.61, 20: 5.34, 25: 5.93 },
            224: { 3: 1.35, 5: 2.30, 10: 4.00, 15: 5.53, 20: 6.46, 25: 7.08 },
            280: { 3: 1.65, 5: 2.51, 10: 4.47, 15: 5.57, 20: 7.38, 25: 8.22 }
          },
          В: {
            200: { 3: 1.83, 5: 2.73, 10: 4.55, 15: 5.75, 20: 6.28 },
            250: { 3: 2.30, 5: 3.54, 10: 6.02, 15: 8.00, 20: 9.23, 25: 9.69 },
            280: { 3: 2.46, 5: 3.77, 10: 6.59, 15: 8.82, 20: 10.27, 25: 11.00 },
            315: { 3: 2.63, 5: 3.88, 10: 7.39, 15: 9.71, 20: 11.33, 25: 12.27 },
            355: { 3: 2.84, 5: 4.29, 10: 7.57, 15: 10.51, 20: 12.42, 25: 13.63 },
            450: { 3: 3.08, 5: 4.74, 10: 8.54, 15: 11.53, 20: 14.15, 25: 15.62 }
          },
          Г: {
            355: { 10: 6.67, 15: 11.17, 20: 14.91, 25: 16.50 },
            500: { 10: 9.75, 15: 15.57, 20: 23.02, 25: 26.47 },
            630: { 10: 10.76, 15: 17.46, 20: 23.60, 25: 27.89, 30: 32.19 },
            800: { 10: 11.14, 15: 19.16, 20: 26.50, 25: 31.11, 30: 34.23 }
          },
          '...' : {
            355: { 10: 6.67, 15: 11.17, 20: 14.91, 25: 16.50 },
            500: { 10: 9.75, 15: 15.57, 20: 23.02, 25: 26.47 },
            630: { 10: 10.76, 15: 17.46, 20: 23.60, 25: 27.89, 30: 32.19 },
            800: { 10: 11.14, 15: 19.16, 20: 26.50, 25: 31.11, 30: 34.23 }
          },
          'УВ' : {
            355: { 10: 6.67, 15: 11.17, 20: 14.91, 25: 16.50 },
            500: { 10: 9.75, 15: 15.57, 20: 23.02, 25: 26.47 },
            630: { 10: 10.76, 15: 17.46, 20: 23.60, 25: 27.89, 30: 32.19 },
            800: { 10: 11.14, 15: 19.16, 20: 26.50, 25: 31.11, 30: 34.23 }
          },
          'УБ' : {
            355: { 10: 6.67, 15: 11.17, 20: 14.91, 25: 16.50 },
            500: { 10: 9.75, 15: 15.57, 20: 23.02, 25: 26.47 },
            630: { 10: 10.76, 15: 17.46, 20: 23.60, 25: 27.89, 30: 32.19 },
            800: { 10: 11.14, 15: 19.16, 20: 26.50, 25: 31.11, 30: 34.23 }
          },
          'УА' : {
            355: { 10: 6.67, 15: 11.17, 20: 14.91, 25: 16.50 },
            500: { 10: 9.75, 15: 15.57, 20: 23.02, 25: 26.47 },
            630: { 10: 10.76, 15: 17.46, 20: 23.60, 25: 27.89, 30: 32.19 },
            800: { 10: 11.14, 15: 19.16, 20: 26.50, 25: 31.11, 30: 34.23 }
          },
          'УО' : {
            355: { 10: 6.67, 15: 11.17, 20: 14.91, 25: 16.50 },
            500: { 10: 9.75, 15: 15.57, 20: 23.02, 25: 26.47 },
            630: { 10: 10.76, 15: 17.46, 20: 23.60, 25: 27.89, 30: 32.19 },
            800: { 10: 11.14, 15: 19.16, 20: 26.50, 25: 31.11, 30: 34.23 }
          },
          'Е' : {
            355: { 10: 6.67, 15: 11.17, 20: 14.91, 25: 16.50 },
            500: { 10: 9.75, 15: 15.57, 20: 23.02, 25: 26.47 },
            630: { 10: 10.76, 15: 17.46, 20: 23.60, 25: 27.89, 30: 32.19 },
            800: { 10: 11.14, 15: 19.16, 20: 26.50, 25: 31.11, 30: 34.23 }
          },
          'Д' : {
            355: { 10: 6.67, 15: 11.17, 20: 14.91, 25: 16.50 },
            500: { 10: 9.75, 15: 15.57, 20: 23.02, 25: 26.47 },
            630: { 10: 10.76, 15: 17.46, 20: 23.60, 25: 27.89, 30: 32.19 },
            800: { 10: 11.14, 15: 19.16, 20: 26.50, 25: 31.11, 30: 34.23 }
          },
        };
        const selectedType = lookupTable[bellType]
        console.log("bell", bellType, "selected", selectedType, "end" )
        const selectedd1 = selectedType[this.getClosest(d1, Object.keys(selectedType).map(value=>parseInt(value)))]
        const selectedv1 = selectedd1[this.getClosest(d1, Object.keys(selectedd1).map(value=>parseInt(value)))]
        return selectedv1
      }
      getClosest(target: number, list: number[]) {
        return list.sort((a, b) => Math.abs(target - a) - Math.abs(target - b))[0]
      }
      pickKd(motorType: string, work: string, load: string) {
        const typeLoadLookupTable: Record<string, Record<string, number>> = {
          "Nhóm I": {
            "Tĩnh": 1,
            "Nhẹ": 1.1,
            "Mạnh": 1.25,
            "Va đập": 1.6
          },
          "Nhóm II": {
            "Tĩnh": 1.1,
            "Nhẹ": 1.25,
            "Mạnh": 1.5,
            "Va đập": 1.7
          },
      
        }
        const workLookupTable: Record<string, number> = {
          "1 ca": 0,
          "2 ca": 0.1,
          "3 ca": 0.2,
        }
        return typeLoadLookupTable[motorType][load] + workLookupTable[work]
      }
      pickCz(z: number) {
        const lookupTable: Record<number, number> = {
          1: 1.00,
          2: 0.95,
          3: 0.95,
          4: 0.90,
          5: 0.90,
          6: 0.85
        }
        return lookupTable[this.getClosest(z, Object.keys(lookupTable).map(value=>parseFloat(value)))]
      }
      pickCu(u: number) {
        const lookupTable: Record<number, number> = {
          1.0: 1.00,
          1.2: 1.07,
          1.6: 1.11,
          1.8: 1.12,
          2.2: 1.13,
          2.4: 1.135,
          3: 1.14
        };
        return lookupTable[this.getClosest(u, Object.keys(lookupTable).map(value=>parseFloat(value)))]
      }
      pickqm(bellType: string) {
        const lookupTable: Record<string, number> = {
          "О": 0.061,
          "А": 0.105,
          "Б": 0.178,
          "В": 0.300
        }
        return lookupTable[bellType]
      }
      pickCL(ratio: number) {
        const lookupTable: Record<number, number> = {
          0.5: 0.86,
          0.6: 0.89,
          0.8: 0.95,
          1.0: 1.00,
          1.2: 1.04,
          1.4: 1.07,
          1.6: 1.10,
          1.8: 1.13,
          2.0: 1.15,
          2.4: 1.20
        };
        return lookupTable[this.getClosest(ratio, Object.keys(lookupTable).map(value=>parseFloat(value)))]
      }
      pickCa(alpha: number) {
        const alphaLookupTable: Record<number, number> = {
          180: 1.00,
          170: 0.98,
          160: 0.95,
          150: 0.92,
          140: 0.89,
          130: 0.86,
          120: 0.82,
          110: 0.78,
          100: 0.73,
           90: 0.68,
           80: 0.62,
           70: 0.56,
        };
        return alphaLookupTable[this.getClosest(alpha, Object.keys(alphaLookupTable).map(value=>parseInt(value)))]
      }
      toNum(input: number | string) {
        if (typeof input === 'number') {
          return input
        }
        return parseFloat(input)
      
      }
      getBellType(Pdc: number, n: number, v1: number = 24) {
        const x = 704.4235 + (-649.2266 - 704.4235) / (1 + (Pdc / 651509)**0.0064268)
        const y = 446.5486 + (-405.6218 - 446.5486) / (1 + (n / 2431369)**0.01021763)
        if(v1 < 25)
          if(x < 11 && y < 3 && y < x - 5.1) {
            return "Д"
          } else 
          if (x < 10 && y < 3.8 && y < x - 2.9) {
            return "Г"
          } else
          if (x < 9 && y < 4.7 && y < x - 0.5) {
            return "В"
          } else
          if (x < 7 && y < 6.2 && y < x + 2.6) {
            return "Б"
          } else
          if (x > 0 && x < 5 && y < 7) {
            return "А"
          } else {
            return "..."
          }
        else {
          if (x < 9 && y < 4.7 && y < x - 0.5) {
            return "УВ"
          } else
          if (x < 7 && y < 6.2 && y < x + 2.6) {
            return "УБ"
          } else
          if (x > 0 && x < 5 && y < 7) {
            return "УА"
          } else {
            return "..."
          }
        }
      }
      pickL(initialL: number) {
        const table = [  400, 425, 450, 475, 500, 530, 560, 600, 630, 670, 710, 750, 800, 850, 900, 950, 
          1000, 1060, 1120, 1180, 1250, 1320, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 
          2120, 2240, 2360, 2500, 2650, 2800, 3000, 3150, 3350, 3750, 4000, 4250, 4500, 
          4750, 5000, 5300, 5600, 6000]
        return table.sort((a, b) => Math.abs(initialL - a) - Math.abs(initialL - b))[0]
      }
      pickd2(unnormalized: number) {
        const standardds = [
          63, 71, 80, 90, 100, 112, 125, 140, 160, 180,
          200, 224, 250, 280, 315, 355, 400, 450, 500,
          560, 630, 710, 800, 900, 1000, 1120, 1250,
          1400, 1600, 1800, 2000, 2240, 2500, 2800,
          3150, 3550, 4000
        ]
        return this.getClosest(unnormalized, standardds)
      }
      pickd1(min: number, max: number) {
        const standardds = [63, 71, 80, 90, 100, 112, 125, 140, 160, 180, 200, 224, 250,
          280, 315, 355, 400, 450, 500, 560, 630, 710, 800, 900, 1000]
        const picks = standardds.filter((d) => d >= min && d <= max)
        return picks[Math.floor((picks.length-1)/2)]
      }
}