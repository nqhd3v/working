import { flatMap } from "lodash";
import { useBlueprint } from "./context";
import BlpDefaultForm from "./default-info-form";
import { useBlpStore } from "@/stores/blueprint";

const BlpDefaultData = () => {
  const user = useBlpStore.useUser();
  const selectedProject = useBlpStore.useSelectedProject();
  const selectedCategory = useBlpStore.useSelectedCategory();
  const setProject = useBlpStore.useUpdateSelectedProject();
  const setCategory = useBlpStore.useUpdateSelectedCategory();
  const {
    states: { loadingProject, loadingCategory, initializing },
  } = useBlueprint();

  if (
    initializing ||
    (selectedProject && selectedCategory && (loadingProject || loadingCategory))
  ) {
    return <div className="text-xs text-gray-400">initializing data...</div>;
  }
  if (!user) {
    return <div className="text-xs text-gray-400">authenticate first</div>;
  }
  if (selectedCategory && selectedProject) {
    return (
      <div>
        <div className="text-xs text-gray-400">
          set <span className="font-bold">{selectedProject.name}</span>/
          <span className="font-bold">{selectedCategory.pjtNm}</span> as default
        </div>
        <div
          className="text-blue-400 cursor-pointer font-bold underline"
          onClick={() => {
            setCategory(null);
            setProject(null);
          }}
        >
          pick other
        </div>
      </div>
    );
  }
  return <BlpDefaultForm />;
};

export default BlpDefaultData;
