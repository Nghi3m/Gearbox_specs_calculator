import { create } from "zustand";

type CalculationNameState = {
    calculationName: string,
    setCalculationName: (calculationName: string) => void
}
const useCalculationNameStore = create<CalculationNameState>((set)=>({
    calculationName: "Bộ truyền đai",
    setCalculationName: (calculationName) => set({calculationName})
}))
export default useCalculationNameStore