import axios from "axios";

// Interface definitions
interface Instance {
  url: string;
  healthCheckPaths: string[];
  enabled: boolean;
}

interface Service {
  index: number;
  instances: Instance[];
}

const loadBalancer: { [key: string]: (service: Service) => Promise<number> } =
  {};

const MAX_RETRIES = 3; // Max Attempts to Check Server Health

loadBalancer.ROUND_ROBIN = async (service: Service): Promise<number> => {
  console.log(`Loadbalancer ${service.index}`);

  const newIndex =
    ++service.index >= service.instances.length ? 0 : service.index;

  service.index = newIndex;

  console.log(
    `Checking if instance ${service.instances[newIndex].url} is enabled`
  );

  const enabledIndex = await loadBalancer.isEnabled(service, newIndex);
  return enabledIndex;
};

loadBalancer.isEnabled = async (
  service: Service,
  index: number
): Promise<number> => {
  const instance = service.instances[index];

  if (await checkHealth(index)) {
    return index;
  } else {
    instance.enabled = false; // Mark the instance as down

    for (let i = 0; i < service.instances.length; i++) {
      const nextIndex = (index + i + 1) % service.instances.length;

      if (await checkHealth(service.instances[nextIndex])) {
        return nextIndex; // Next Health Index
      }
    }
  }
  return -1;
};

export default loadBalancer;
