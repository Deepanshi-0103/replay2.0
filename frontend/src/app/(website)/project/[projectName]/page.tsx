import LiveExecution from "@/src/components/LiveExecution/LiveExecution";

const ProjectName = async ({
  params,
}: {
  params: Promise<{ projectName: string }>;
}) => {
  const { projectName } = await params;
  return (
    <div className="mt-[100px]">
      <LiveExecution projectId={projectName} />
    </div>
  );
};

export default ProjectName;
