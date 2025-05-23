import ICalculationStrategy from "@/misc/ICalculationStrategy";
import { Inputs, Ranges, Result, Selected } from "@/misc/types";
import { Motor, motorCatalogue } from "@/models/MotorCatalogue";
export default class PowerCalculationModel implements ICalculationStrategy {
    getName() {
        return "Công suất động cơ"
    }
    getOptions() {
        return null
    }
    getDefaultInput(): Inputs {
        return {
            "Pt": "5.5",
            "n": "70",
            "ηkn": "1",
            "ηđt": "0.955",
            "ηrc": "0.96",
            "ηrt": "0.97",
            "ηol": "0.99",
            uh: "12.5",
            ud: "3",
        }
    }
    getDefaultSelected(): Selected | null {
        return null
    }
    getRanges(): Ranges {
        return {
            "ηkn": { min: 0.99, max: 0.995 },
            "ηđt": { min: 0.95, max: 0.97 },
            "ηrc": { min: 0.96, max: 0.98 },
            "ηrt": { min: 0.95, max: 0.97 },
            "ηol": { min: 0.99, max: 0.995 },
            "Pt": { min: 0, max: Infinity },
            "n": { min: 0, max: Infinity },
            uh: { min: 10, max: 25 },
            ud: { min: 3, max: 5 },
          }
    }
    calculate(inputs: Inputs, selected: Selected | null): Result {
        let result: Result = {}
        result['η'] = 
            parseFloat(inputs["ηkn"]) *
            parseFloat(inputs["ηđt"]) *
            parseFloat(inputs["ηrc"]) *
            parseFloat(inputs["ηrt"]) *
            parseFloat(inputs["ηol"]) ** 3;
        result.Pdc = parseFloat(inputs["Pt"]) / result['η']
        result.uch = parseFloat(inputs.uh) * parseFloat(inputs.ud)
        result.nsb = result.uch * parseFloat(inputs.n)
        const pickedMotor = this.pickMotor(motorCatalogue, result.Pdc, result.nsb)
        console.log("picked", pickedMotor)
        result.Model = pickedMotor.model
        result.kW = pickedMotor.power_kW
        result.rpm = pickedMotor.speed
        result.cosp = pickedMotor.cos_phi
        result['n%'] = pickedMotor.efficiency_percent
        result['Tmax/Tdn   '] = pickedMotor.Tms_Tn
        result['Tk/Tdn'] = pickedMotor.Tk_Tn
        return result
    }
    pickMotor (motors: Motor[], powerMinimum: number, RPMTarget: number) {
        const aboveMinimumPower = motors.filter((motor: Motor) => motor.power_kW >= powerMinimum)
        const sortedBySpeedDiff = aboveMinimumPower.sort((a: Motor, b: Motor) => {
          return Math.abs(RPMTarget - a.speed) - Math.abs(RPMTarget - b.speed)
        })
        return sortedBySpeedDiff[0]
    }
}