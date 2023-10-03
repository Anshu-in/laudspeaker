import ReactFlow, {
  applyNodeChanges,
  Controls,
  EdgeChange,
  EdgeProps,
  MarkerType,
  NodeChange,
  NodeProps,
} from "reactflow";
import { useAppDispatch, useAppSelector } from "store/hooks";
import "reactflow/dist/style.css";
import {
  changeNodeData,
  deselectNodes,
  setJumpToTargettingNode,
  setNodes,
} from "reducers/flow-builder.reducer";
import {
  EmptyNode,
  ExitNode,
  InsertNode,
  JumpToNode,
  MessageNode,
  StartNode,
  TimeDelayNode,
  TimeWindowNode,
  TrackerNode,
  UserAttributeNode,
  WaitUntilNode,
} from "./Nodes";
import FlowBuilderSidePanel from "./SidePanel/FlowBuilderSidePanel";
import { BranchEdge, PrimaryEdge } from "./Edges";
import { FC, useEffect, useRef } from "react";
import NodeDraggingProvider from "./FlowPlugins/NodeDraggingProvider";
import Button, { ButtonType } from "components/Elements/Buttonv2";
import { JumpToNodeData } from "./Nodes/NodeData";

export enum NodeType {
  START = "start",
  EMPTY = "empty",
  MESSAGE = "message",
  JUMP_TO = "jumpTo",
  EXIT = "exit",
  WAIT_UNTIL = "waitUntil",
  TIME_DELAY = "timeDelay",
  TIME_WINDOW = "timeWindow",
  USER_ATTRIBUTE = "userAttribute",
  INSERT_NODE = "insertNode",
  TRACKER = "tracker",
}

export enum EdgeType {
  PRIMARY = "primary",
  BRANCH = "branch",
}

const nodeTypes: Record<NodeType, FC<NodeProps<any>>> = {
  [NodeType.START]: StartNode,
  [NodeType.EMPTY]: EmptyNode,
  [NodeType.MESSAGE]: MessageNode,
  [NodeType.JUMP_TO]: JumpToNode,
  [NodeType.EXIT]: ExitNode,
  [NodeType.WAIT_UNTIL]: WaitUntilNode,
  [NodeType.TIME_DELAY]: TimeDelayNode,
  [NodeType.TIME_WINDOW]: TimeWindowNode,
  [NodeType.USER_ATTRIBUTE]: UserAttributeNode,
  [NodeType.INSERT_NODE]: InsertNode,
  [NodeType.TRACKER]: TrackerNode,
};

const edgeTypes: Record<EdgeType, FC<EdgeProps<any>>> = {
  [EdgeType.PRIMARY]: PrimaryEdge,
  [EdgeType.BRANCH]: BranchEdge,
};

interface FlowEditorProps {
  isViewMode?: boolean;
  className?: string;
  onMove?: () => void;
  onMoveEnd?: () => void;
}

export const nodeTypesNotConnectableByJumpTo: (string | undefined)[] = [
  NodeType.EMPTY,
  NodeType.INSERT_NODE,
  NodeType.JUMP_TO,
  NodeType.START,
];

const FlowEditor: FC<FlowEditorProps> = ({
  className,
  isViewMode,
  onMove = () => {},
  onMoveEnd = () => {},
}) => {
  const { nodes, edges, stepperIndex, isOnboarding, jumpToTargettingNode } =
    useAppSelector((state) => state.flowBuilder);

  const dispatch = useAppDispatch();

  const onNodesChange = (changes: NodeChange[]) => {
    changes = changes.filter(
      (change) =>
        change.type === "select" &&
        nodes.find((node) => node.id === change.id)?.type !== NodeType.EMPTY
    );

    dispatch(setNodes(applyNodeChanges(changes, nodes)));
  };

  const onEdgesChange = (changes: EdgeChange[]) => {
    console.log(changes);

    // dispatch(setEdges(applyEdgeChanges(changes, edges)));
  };

  const flowRef = useRef<HTMLDivElement>(null);

  const selectedNode = nodes.find((node) => node.selected);

  useEffect(() => {
    if (!jumpToTargettingNode || !selectedNode) return;

    if (
      selectedNode.id === jumpToTargettingNode ||
      nodeTypesNotConnectableByJumpTo.includes(selectedNode.type)
    ) {
      dispatch(deselectNodes());
      return;
    }

    dispatch(
      changeNodeData({
        id: jumpToTargettingNode,
        data: {
          type: NodeType.JUMP_TO,
          targetId: selectedNode.id,
          stepId: nodes.find((node) => node.id === jumpToTargettingNode)?.data
            .stepId,
        } as JumpToNodeData,
      })
    );
    dispatch(setJumpToTargettingNode(undefined));
  }, [selectedNode, jumpToTargettingNode]);

  return (
    <div
      className={`relative w-full h-full bg-[#F3F4F6] text-[#111827] flex flex-col ${
        className ? className : ""
      }`}
    >
      {jumpToTargettingNode && (
        <div className="w-full px-[16px] py-[10px] bg-[#6366F1] rounded-[2px] flex justify-center items-center gap-[20px] text-white font-inter text-[16px] font-semibold leading-[24px]">
          <div>Navigate the journey and select the target step</div>
          <Button
            type={ButtonType.SECONDARY}
            onClick={() => dispatch(setJumpToTargettingNode(undefined))}
          >
            Cancel
          </Button>
        </div>
      )}
      <div className="w-full h-full flex">
        <ReactFlow
          nodes={
            isViewMode
              ? nodes.filter((node) => node.type !== NodeType.EMPTY)
              : nodes
          }
          edges={edges}
          onInit={(ev) => {
            ev.fitView();
            ev.zoomTo(0.8);

            if (isViewMode && stepperIndex !== 2) {
              const { x, y } = ev.getViewport();
              ev.setViewport({ x: x - 200, y, zoom: 0.8 });
            }
          }}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onMove={onMove}
          onMoveEnd={onMoveEnd}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          panOnScroll
          selectionOnDrag
          nodeOrigin={[0.5, 0.5]}
          defaultEdgeOptions={{
            markerEnd: {
              type: MarkerType.Arrow,
              color: "#111827",
              strokeWidth: 2,
            },
            style: {
              stroke: "#111827",
            },
          }}
          ref={flowRef}
        >
          <NodeDraggingProvider flowRef={flowRef} />
          <Controls
            showInteractive={false}
            position="top-left"
            className="rounded-[2px]"
          />
        </ReactFlow>
        {!isViewMode && !isOnboarding && stepperIndex === 0 && (
          <FlowBuilderSidePanel />
        )}
      </div>
    </div>
  );
};

export default FlowEditor;
