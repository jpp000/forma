import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs tintColor="#007AFF">
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf={{ default: "house", selected: "house.fill" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="nutrition">
        <Label>Nutrition</Label>
        <Icon sf={{ default: "fork.knife", selected: "fork.knife" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="workout">
        <Label>Workout</Label>
        <Icon
          sf={{
            default: "figure.strengthtraining.traditional",
            selected: "figure.strengthtraining.traditional",
          }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="progress">
        <Label>Progress</Label>
        <Icon sf={{ default: "chart.bar", selected: "chart.bar.fill" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Label>Profile</Label>
        <Icon
          sf={{
            default: "person.crop.circle",
            selected: "person.crop.circle.fill",
          }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
