import {
  EmailIcon,
  SMSIcon,
  SlackIcon,
  PushIcon,
  WebhookIcon,
  ExitIcon,
  TimeDelayIcon,
  TimeWindowIcon,
  WaitUntilIcon,
  JumpToIcon,
  CustomModalIcon,
  UserAttributeIcon,
} from "pages/FlowBuilderv2/Icons";
import { FlowBuilderDrawerFixture } from "./FlowBuilderDrawer";

export enum DrawerAction {
  EMAIL = "email",
  SMS = "sms",
  SLACK = "slack",
  PUSH = "push",
  WEBHOOK = "webhook",
  CUSTOM_MODAL = "customModal",
  TRACKER = "tracker",
  JUMP_TO = "jumpTo",
  EXIT = "exit",
  WAIT_UNTIL = "waitUntil",
  TIME_DELAY = "timeDelay",
  TIME_WINDOW = "timeWindow",
  USER_ATTRIBUTE = "userAttribute",
}

const flowBuilderDrawerFixtures: FlowBuilderDrawerFixture[] = [
  {
    groupName: "Messages & Step",
    children: [
      {
        id: DrawerAction.EMAIL,
        icon: EmailIcon(),
        text: "Email",
      },
      {
        id: DrawerAction.SMS,
        icon: SMSIcon(),
        text: "SMS",
      },
      // Removed for 1 release
      // {
      //   id: DrawerAction.SLACK,
      //   icon: SlackIcon(),
      //   text: "Slack",
      // },
      // {
      //   id: DrawerAction.PUSH,
      //   icon: PushIcon(),
      //   text: "Push Notification",
      // },
      {
        id: DrawerAction.WEBHOOK,
        icon: WebhookIcon(),
        text: "Webhook",
      },
      // {
      //   id: DrawerAction.CUSTOM_MODAL,
      //   icon: CustomModalIcon(),
      //   text: "Custom Modal",
      // },
      {
        id: DrawerAction.TRACKER,
        icon: CustomModalIcon(),
        text: "Custom Component",
      },
      {
        id: DrawerAction.JUMP_TO,
        icon: JumpToIcon(),
        text: "Jump To",
      },
      {
        id: DrawerAction.EXIT,
        icon: ExitIcon(),
        text: "Exit",
      },
    ],
  },
  {
    groupName: "Trigger",
    children: [
      {
        id: DrawerAction.WAIT_UNTIL,
        icon: WaitUntilIcon(),
        text: "Wait Until",
      },
      {
        id: DrawerAction.TIME_DELAY,
        icon: TimeDelayIcon(),
        text: "Time Delay",
      },
      {
        id: DrawerAction.TIME_WINDOW,
        icon: TimeWindowIcon(),
        text: "Time Window",
      },
      {
        id: DrawerAction.USER_ATTRIBUTE,
        icon: UserAttributeIcon(),
        text: "User Attribute",
      },
    ],
  },
];

export default flowBuilderDrawerFixtures;
