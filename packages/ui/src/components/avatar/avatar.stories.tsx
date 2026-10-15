import type { Meta, StoryObj } from "@storybook/react-vite";
import { User } from "lucide-react";
import { storyMessages } from "../../stories/messages";
import { StoryRow } from "../../stories/story-row";
import { ThemePanels } from "../../stories/theme-panels";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

const SIZES = ["sm", "md", "lg"] as const;

// Imagen de ejemplo embebida, para que la story no dependa de internet.
const SAMPLE_IMAGE = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#1e50a2"/><circle cx="32" cy="26" r="12" fill="#89c3eb"/><rect x="12" y="42" width="40" height="22" rx="11" fill="#89c3eb"/></svg>',
)}`;

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const meta = {
  title: "Componentes/Avatar",
  component: Avatar,
  args: { size: "md" },
  argTypes: { size: { control: "inline-radio", options: SIZES } },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args, { globals }) => {
    const { name } = storyMessages(globals.locale).avatar;
    return (
      <Avatar {...args}>
        <AvatarImage src={SAMPLE_IMAGE} alt={name} />
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
    );
  },
};

export const TamañosYEstados: Story = {
  name: "Tamaños y estados",
  render: (_args, { globals }) => {
    const t = storyMessages(globals.locale);
    const { name } = t.avatar;
    return (
      <ThemePanels labels={t}>
        <div className="flex flex-col gap-4">
          {SIZES.map((size) => (
            <StoryRow key={size} label={size}>
              <Avatar size={size}>
                <AvatarImage src={SAMPLE_IMAGE} alt={name} />
                <AvatarFallback>{initials(name)}</AvatarFallback>
              </Avatar>
              <Avatar size={size}>
                <AvatarFallback>{initials(name)}</AvatarFallback>
              </Avatar>
              <Avatar size={size}>
                <AvatarFallback>
                  <User aria-hidden="true" className="size-1/2" />
                </AvatarFallback>
              </Avatar>
            </StoryRow>
          ))}
          <StoryRow label={t.states.error}>
            <Avatar>
              <AvatarImage src="/no-existe.png" alt={name} />
              <AvatarFallback>{initials(name)}</AvatarFallback>
            </Avatar>
            <span className="text-sm opacity-70">{t.avatar.brokenImage}</span>
          </StoryRow>
        </div>
      </ThemePanels>
    );
  },
};
