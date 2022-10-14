import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  Background,
  useReactFlow,
  ReactFlowProvider,
  useViewport,
  MarkerType,
  ConnectionLineType,
} from "react-flow-renderer";
import { v4 as uuid } from "uuid";
import { useParams, useNavigate } from "react-router-dom";

import * as _ from "lodash";

import TextUpdaterNode from "./TextUpdater";
import ExitIcon from "../../assets/images/ExitIcon.svg";
import { Box, Modal, MenuItem, Snackbar, Alert } from "@mui/material";
import Drawer from "./../../components/Drawer/index";
import SideDrawer from "components/SideDrawer";
import { ApiConfig } from "./../../constants";
import ChooseTemplateModal from "./ChooseTemplateModal";
import { MySegment, NameSegment } from "pages/Segment";
import ApiService from "services/api.service";
import TriggerModal from "./TriggerModal";
import { GenericButton, Select } from "components/Elements";
import { getFlow } from "./FlowHelpers";

enum TriggerType {
  event,
  time_delay,
  time_window,
}

const convertLayoutToTable = (
  name: string,
  nodes: Node[],
  edges: Edge[]
): any => {
  const dto: {
    name: string;
    audiences: string[];
    rules: {
      type: TriggerType;
      source: string;
      dest: string[];
      properties: {
        event: string;
      };
    }[];
    visualLayout: {
      nodes: Node<any>[];
      edges: Edge<any>[];
    };
  } = {
    name: name,
    audiences: [],
    rules: [],
    visualLayout: { nodes: nodes, edges: edges },
  };
  for (let index = 0; index < edges.length; index++) {
    const fromNode = _.filter(nodes, (node: any) => {
      return node.id == edges[index].source;
    });
    const toNode = _.filter(nodes, (node: any) => {
      return node.id == edges[index].target;
    });
    let foundTriggerIndex = 0;
    for (
      let triggerIndex = 0;
      triggerIndex < fromNode[0].data.triggers.length;
      triggerIndex++
    ) {
      if (
        fromNode[0].data.triggers[triggerIndex].id == edges[index].sourceHandle
      )
        foundTriggerIndex = triggerIndex;
    }

    const rule = {
      type: TriggerType.event,
      source: fromNode[0]?.data?.audienceId,
      dest: [toNode[0].data.audienceId],
      properties: {
        event:
          fromNode[0]?.data.triggers[foundTriggerIndex]?.properties
            ?.conditions[0]?.value,
      },
    };
    dto.rules.push(rule);
  }
  for (let index = 0; index < nodes.length; index++) {
    dto.audiences.push(nodes[index].data.audienceId);
  }

  return dto;
};

const Flow = () => {
  const { name } = useParams();
  const [flowId, setFlowId] = useState<string>("");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [triggers, setTriggers] = useState<any>([]);
  const [selectedTrigger, setSelectedTrigger] = useState<any>(undefined);
  const [selectedNode, setSelectedNode] = useState<string>("");
  const [templateModalOpen, setTemplateModalOpen] = useState<boolean>(false);
  const [audienceModalOpen, setAudienceModalOpen] = useState<boolean>(false);
  const [triggerModalOpen, settriggerModalOpen] = useState<boolean>(false);
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [audienceEditModalOpen, setAudienceEditModalOpen] =
    useState<boolean>(false);
  const [selectedMessageType, setSelectedMessageType] = useState<any>("");

  const onHandleClick = (e: any, triggerId: any) => {
    return { e, triggerId };
  };
  const onTriggerSelect = (e: any, triggerId: any, triggersList: any) => {
    const trigger = triggersList.find((item: any) => item.id === triggerId);
    setSelectedTrigger(trigger);
    settriggerModalOpen(true);
  };

  useEffect(() => {}, [triggers]);
  const navigate = useNavigate();
  useLayoutEffect(() => {
    const populateFlowBuilder = async () => {
      const { data } = await getFlow(name);
      if (data.isActive) {
        return navigate(`/flow/${name}/view`);
      }
      setFlowId(data.id);
      if (data.visualLayout) {
        const updatedNodes = data.visualLayout.nodes.map((item: any) => {
          return {
            ...item,
            data: {
              ...item.data,
              onTriggerSelect,
            },
          };
        });
        setNodes(updatedNodes);
        setEdges(data.visualLayout.edges);
      }
    };
    populateFlowBuilder();
  }, []);

  const generateNode = (node: any, dataTriggers: any) => {
    const {
      position,
      id,
      audienceId,
      triggers: nodeTriggers,
      messages,
      data,
    } = node;
    return {
      id,
      position,
      type: "special",
      data: {
        primary: nodes.length < 1,
        audienceId,
        triggers: nodeTriggers,
        messages,
        onHandleClick,
        dataTriggers,
        onTriggerSelect,
        ...data,
      },
    };
  };

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes, triggers, nodes]
  );

  useEffect(() => {
    const filteredNewNodes = nodes.filter((node) => node.data.isNew);
    if (filteredNewNodes.length) {
      const edgeData: Edge[] = [];
      for (let i = 0; i < filteredNewNodes.length; i++) {
        edgeData.push({
          id: uuid(),
          source: selectedNode,
          target: filteredNewNodes[i].id,
          markerEnd: {
            type: MarkerType.Arrow,
            strokeWidth: 2,
            height: 20,
            width: 20,
          },
          type: ConnectionLineType.SmoothStep,
        });
      }

      setEdges([...edges, ...edgeData]);

      const removedIsNewNodes = nodes.map((node) => {
        delete node?.data?.isNew;
        return node;
      });
      setNodes(removedIsNewNodes);
    }
  }, [nodes]);
  const onNodeDragStart = useCallback(
    (event: React.MouseEvent, node: Node, allNodes: Node[]) => {
      setSelectedNode(node.id);
    },
    [nodes, triggers]
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges, triggers]
  );
  const onConnect = useCallback(
    (connection: Connection | Edge) =>
      setEdges((eds) => {
        const edge: Edge | Connection = {
          ...connection,
          id: uuid(),
          markerEnd: {
            type: MarkerType.Arrow,
            strokeWidth: 2,
            height: 20,
            width: 20,
          },
          type: ConnectionLineType.SmoothStep,
        };
        return addEdge(edge, eds);
      }),
    [setEdges, triggers]
  );

  const onClickConnectionStart = useCallback(
    (event: React.MouseEvent, arg2: any) => {
      console.log(event, arg2);
    },
    [triggers]
  );

  const onNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
      if (event.detail == 2) {
        if (!audienceEditModalOpen) {
          setAudienceEditModalOpen(true);
        }
      }
    },
    [setNodes, triggers]
  );

  const onPaneClick = useCallback((event: React.MouseEvent) => {
    setSelectedNode("");
  }, []);

  const rfStyle = {
    backgroundColor: "rgba(112,112,112, 0.06)",
  };

  const nodeTypes = useMemo(() => ({ special: TextUpdaterNode }), [triggers]);
  const { setViewport } = useReactFlow();
  const { x: viewX, y: viewY } = useViewport();
  const [zoomState, setZoomState] = useState(1);
  const possibleViewZoomValues = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  const performAction = (id: string) => {
    switch (id) {
      case "audience": {
        setAudienceModalOpen(true);
        break;
      }
      case "trueFalse": {
        const tempNodes = [];
        const selectedNodeData = nodes.find((node) => node.id === selectedNode);
        for (let i = 0; i < 2; i++) {
          const nodeId = uuid();
          const newNode = {
            id: nodeId,
            audienceId: "",
            triggers: [],
            messages: [],
            position: {
              x: (selectedNodeData?.position?.x || 0) - (i === 0 ? -100 : 100),
              y: (selectedNodeData?.position?.y || 0) + 200,
            },
            data: {
              isNew: true,
              hidden: true,
            },
          };
          tempNodes.push(generateNode(newNode, triggers));
        }
        setNodes([...nodes, ...tempNodes]);
        break;
      }
      case "exit": {
        const nodeId = uuid();
        const selectedNodeData = nodes.find((node) => node.id === selectedNode);
        const newNode = {
          id: nodeId,
          audienceId: "",
          triggers: [],
          messages: [],
          position: {
            x: (selectedNodeData?.position?.x || 0) + 100,
            y: (selectedNodeData?.position?.y || 0) + 200,
          },
          data: {
            isNew: true,
            isExit: true,
            preIcon: ExitIcon,
            name: "Exit",
            description: "",
            width: "fit-content",
          },
        };
        setNodes([...nodes, generateNode(newNode, triggers)]);
        break;
      }
      case "timeDelay": {
        const selectedNodeData = nodes.find((node) => node.id === selectedNode);
        const triggerId = uuid();
        const trigger = {
          id: triggerId,
          title: "Time Delay",
          type: "timeDelay",
          properties: {},
        };
        setTriggers([...triggers, trigger]);
        selectedNodeData?.data?.triggers.push(trigger);
        setNodes([...nodes]);
        setSelectedTrigger(trigger);
        settriggerModalOpen(true);
        break;
      }
      case "timeWindow": {
        const selectedNodeData = nodes.find((node) => node.id === selectedNode);
        const triggerId = uuid();
        const trigger = {
          id: triggerId,
          title: "Time Window",
          type: "timeWindow",
          properties: {},
        };
        setTriggers([...triggers, trigger]);
        selectedNodeData?.data?.triggers.push(trigger);
        setSelectedTrigger(trigger);
        setNodes([...nodes]);
        settriggerModalOpen(true);
        break;
      }
      case "eventBased": {
        const selectedNodeData = nodes.find((node) => node.id === selectedNode);
        const triggerId = uuid();
        const trigger = {
          id: triggerId,
          title: "Event Based",
          type: "eventBased",
          properties: {},
        };

        setTriggers([...triggers, trigger]);
        selectedNodeData?.data?.triggers.push(trigger);
        setSelectedTrigger(trigger);
        setNodes([...nodes]);
        settriggerModalOpen(true);
        break;
      }
      case "email":
      case "push":
      case "sms":
      case "slack": {
        setSelectedMessageType(id);
        setTemplateModalOpen(true);
        break;
      }
      default:
        break;
    }
  };

  const handleTriggerModalOpen = (e: any) => {
    settriggerModalOpen(!triggerModalOpen);
  };
  const onSaveTrigger = (data: any) => {
    settriggerModalOpen(false);
    selectedTrigger.properties = data;
  };
  const onDeleteTrigger = (data: any) => {
    const selectedNodeData = nodes.find((node) =>
      node.data.triggers.find((item: any) => item.id === data)
    );
    const newTriggersData: any = selectedNodeData?.data?.triggers.filter(
      (item: any) => item.id !== data
    );
    if (selectedNodeData != undefined) {
      selectedNodeData.data.triggers = newTriggersData;
      setNodes([...nodes]);
      settriggerModalOpen(false);
    }
  };
  const handleTemplateModalOpen = async ({ activeTemplate }: any) => {
    if (activeTemplate == null || activeTemplate == "") {
      setTemplateModalOpen(!templateModalOpen);
      return;
    }
    const selectedNodeData = nodes.find((node) => node.id === selectedNode);
    const messages = selectedNodeData?.data?.messages as {
      type: string;
      templateId: string;
    }[];
    const foundMessage = messages.find(
      (message) =>
        message.type === selectedMessageType &&
        message.templateId === activeTemplate
    );
    if (!foundMessage) {
      messages?.push({
        type: selectedMessageType,
        templateId: activeTemplate,
      });

      await ApiService.patch({
        url: `${ApiConfig.addtemplate}`,
        options: {
          audienceId: selectedNodeData?.data.audienceId,
          templateId: activeTemplate.toString(),
        },
      });
    } else {
      setSnackBarOpen(true);
    }

    setNodes([...nodes]);
    setTemplateModalOpen(!templateModalOpen);
  };

  const handleSaveJourney = async () => {
    console.log(nodes);
    console.log(edges);
    console.log(triggers);
    const dto = convertLayoutToTable(name, nodes, edges);
    dto.audiences = (dto.audiences as string[]).filter((item) => !!item);

    await ApiService.patch({
      url: `${ApiConfig.flow}/${name}`,
      options: {
        ...dto,
        id: flowId,
      },
    });
  };

  const handleStartJourney = async () => {
    await ApiService.get({
      url: `${ApiConfig.startFlow}/${flowId}`,
    });
    window.location.reload();
  };

  const handleAudienceSubmit = async (segment: any) => {
    const { data } = await ApiService.post({
      url: `${ApiConfig.createSegment}`,
      options: {
        ...segment,
      },
    });
    setAudienceModalOpen(true);
    const newNode = {
      id: uuid(),
      triggers: [],
      messages: [],
      position: { x: 0, y: 0 },
      audienceId: data.id,
    };
    setNodes([...nodes, generateNode(newNode, triggers)]);
    setAudienceModalOpen(false);
  };
  const handleAudienceEdit = async () => {
    setAudienceEditModalOpen(true);
    setAudienceEditModalOpen(false);
  };

  const handleSnackBarClose = () => {
    setSnackBarOpen(false);
  };

  return (
    <Box height="100vh" display="flex" width="100%">
      <Snackbar
        open={snackBarOpen}
        autoHideDuration={5000}
        onClose={handleSnackBarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" sx={{ width: "100%" }}>
          Can't connect same template twice to one node!
        </Alert>
      </Snackbar>
      <Box display="flex">
        <Box display="flex">
          <SideDrawer selectedNode={selectedNode} onClick={performAction} />
        </Box>
      </Box>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onPaneClick={onPaneClick}
        onNodeDragStart={onNodeDragStart}
        onClickConnectStart={onClickConnectionStart}
        connectionLineType={ConnectionLineType.SmoothStep}
        onConnect={onConnect}
        style={rfStyle}
        nodeTypes={nodeTypes}
        zoomOnScroll={false}
        zoomOnPinch={false}
        defaultZoom={1}
        zoomOnDoubleClick={false}
      >
        <div
          style={{
            position: "absolute",
            zIndex: "111",
            display: "flex",
            right: "15px",
            inset: " 20px 20px auto auto",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box data-saveflowbutton sx={{ margin: "0 7.5px" }}>
            <GenericButton
              variant="contained"
              onClick={handleSaveJourney}
              fullWidth
              sx={{
                maxWidth: "158px",
                maxHeight: "48px",
                "background-image":
                  "linear-gradient(to right, #6BCDB5 , #307179, #122F5C)",
                padding: "13px 25px",
              }}
              size={"medium"}
            >
              Save
            </GenericButton>
          </Box>
          <Box data-startflowbutton sx={{ margin: "0 7.5px" }}>
            <GenericButton
              variant="contained"
              onClick={handleStartJourney}
              fullWidth
              sx={{
                maxWidth: "158px",
                maxHeight: "48px",
                "background-image":
                  "linear-gradient(to right, #6BCDB5 , #307179, #122F5C)",
                padding: "13px 25px",
              }}
              size={"medium"}
            >
              Start
            </GenericButton>
          </Box>
          <Select
            id="zoomSelect"
            value={zoomState}
            onChange={(e) => {
              setZoomState(+e.target.value);
              setViewport({ x: viewX, y: viewY, zoom: +e.target.value });
            }}
            sx={{ margin: "0 7.5px" }}
          >
            {possibleViewZoomValues.map((value) => (
              <MenuItem value={value}>{value * 100 + "%"}</MenuItem>
            ))}
          </Select>
        </div>
        <Background size={0} />
      </ReactFlow>
      {templateModalOpen ? (
        <ChooseTemplateModal
          templateModalOpen={templateModalOpen}
          handleTemplateModalOpen={handleTemplateModalOpen}
          selectedMessageType={selectedMessageType}
          isCollapsible={true}
          onClose={() => setTemplateModalOpen(false)}
        />
      ) : null}
      {audienceModalOpen ? (
        <Modal
          open={audienceModalOpen}
          onClose={() => {}}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <NameSegment
            onSubmit={handleAudienceSubmit}
            isPrimary={nodes.length < 1}
            isCollapsible={true}
            onClose={() => setAudienceModalOpen(false)}
          />
        </Modal>
      ) : null}
      {triggerModalOpen && (
        <TriggerModal
          triggerModalOpen={triggerModalOpen}
          handleTriggerModalOpen={handleTriggerModalOpen}
          selectedTrigger={selectedTrigger}
          onSaveTrigger={onSaveTrigger}
          onDeleteTrigger={onDeleteTrigger}
          isCollapsible={true}
          onClose={() => settriggerModalOpen(false)}
        />
      )}
      {audienceEditModalOpen &&
      _.filter(nodes, (node: any) => {
        return node.id == selectedNode;
      })[0]?.data?.primary ? (
        <Modal
          open={audienceEditModalOpen}
          onClose={() => {}}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <MySegment
            onSubmit={handleAudienceEdit}
            audienceId={
              _.filter(nodes, (node: any) => {
                return node.id == selectedNode;
              })[0].data.audienceId
            }
            isCollapsible={true}
            onClose={() => setAudienceEditModalOpen(false)}
          />
        </Modal>
      ) : null}
    </Box>
  );
};
// const selectedNodeData = nodes.find((node) => node.id === selectedNode);
// selectedNodeData?.data?.messages.push({ type: id, templateId: "test" });
// setNodes([...nodes]);
function FlowBuilder() {
  return (
    <>
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </>
  );
}
export default FlowBuilder;
