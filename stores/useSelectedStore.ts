import { Selected } from "@/misc/types";
import BeltCalculationModel from "@/models/BeltCalculationModel";
import { create } from "zustand";

type SelectedState = {
    selected: Selected | null,
    setSelected: (selected: Selected | null) => void
}
const useSelectedStore = create<SelectedState>((set)=>({
    selected: new BeltCalculationModel().getDefaultSelected(),
    setSelected: (selected) => set({selected})
}))
export default useSelectedStore