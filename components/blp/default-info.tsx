import { flatMap } from "lodash";
import { useBlueprint } from "./context";
import BlpDefaultForm from "./default-info-form";

const BlpDefaultData = () => {
  const {
    states: {
      selectedCategory,
      selectedProject,
      loadingProject,
      loadingCategory,
      initializing,
      projects,
      categories,
    },
    resetLocal,
  } = useBlueprint();

  if (
    initializing ||
    (selectedProject && selectedCategory && (loadingProject || loadingCategory))
  ) {
    return <div className="text-xs text-gray-400">initializing data...</div>;
  }
  if (selectedCategory && selectedProject) {
    const projectName = projects.find((p) => p.id === selectedProject)?.name;
    const categoryName = flatMap(categories, (c) => c.subItems).find(
      (c) => c.pjtId === selectedCategory
    )?.pjtNm;
    return (
      <div>
        <div className="text-xs text-gray-400">
          set <span className="font-bold">{projectName}</span>/
          <span className="font-bold">{categoryName}</span> as default
        </div>
        <div
          className="text-blue-400 cursor-pointer font-bold underline"
          onClick={() => resetLocal()}
        >
          pick other
        </div>
      </div>
    );
  }
  return <BlpDefaultForm />;
};

export default BlpDefaultData;
