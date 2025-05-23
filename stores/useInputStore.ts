import { Inputs } from "@/misc/types";
import BeltCalculationModel from "@/models/BeltCalculationModel";
import { create } from "zustand";

type InputsState = {
    inputs: Inputs,
    setInputs: (inputs: Inputs) => void
}
const useInputStore = create<InputsState>((set)=>({
    inputs: new BeltCalculationModel().getDefaultInput(),
    setInputs: (inputs) => set({inputs})
}))
export default useInputStore