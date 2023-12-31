type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
type InputTag = "input" | "textarea" | "json";
type Field = InputTag | { [key: string]: Field };
type Fields = Record<string, Field>;

type operation = {
  name: string;
  endpoint: string;
  method: HttpMethod;
  fields: Fields;
};

const operations: operation[] = [
  {
    name: "Get Session User (logged in user)",
    endpoint: "/api/session",
    method: "GET",
    fields: {},
  },
  {
    name: "Create User",
    endpoint: "/api/users",
    method: "POST",
    fields: { username: "input", password: "input", name: "input", sex: "input", dob: "input" },
  },
  {
    name: "Login",
    endpoint: "/api/login",
    method: "POST",
    fields: { username: "input", password: "input" },
  },
  {
    name: "Logout",
    endpoint: "/api/logout",
    method: "POST",
    fields: {},
  },
  {
    name: "Update User",
    endpoint: "/api/users",
    method: "PATCH",
    fields: { update: { username: "input", password: "input" } },
  },
  {
    name: "Delete User",
    endpoint: "/api/users",
    method: "DELETE",
    fields: {},
  },
  {
    name: "Get Users (empty for all)",
    endpoint: "/api/users/:username",
    method: "GET",
    fields: { username: "input" },
  },
  {
    name: "Get Posts (empty for all)",
    endpoint: "/api/posts",
    method: "GET",
    fields: { author: "input" },
  },
  {
    name: "Create Post",
    endpoint: "/api/posts",
    method: "POST",
    fields: { content: "input" },
  },
  {
    name: "Update Post",
    endpoint: "/api/posts/:id",
    method: "PATCH",
    fields: { id: "input", update: { content: "input", options: { backgroundColor: "input" }, likes: "input", dislikes: "input" } },
  },
  {
    name: "Delete Post",
    endpoint: "/api/posts/:id",
    method: "DELETE",
    fields: { id: "input" },
  },
  {
    name: "Create WordList",
    endpoint: "/api/censoredwordlist",
    method: "POST",
    fields: {},
  },
  {
    name: "Add word to WordList",
    endpoint: "/api/censorwordlist/add/:id",
    method: "PATCH",
    fields: { id: "input", word: "input" },
  },
  {
    name: "Delete word to WordList",
    endpoint: "/api/censorwordlist/delete/:id",
    method: "PATCH",
    fields: { id: "input", word: "input" },
  },
  {
    name: "Delete WordList",
    endpoint: "/api/censorwordlist/:id",
    method: "DELETE",
    fields: { id: "input" },
  },
  {
    name: "Get WordList",
    endpoint: "/api/censorwordlist/:id",
    method: "GET",
    fields: { id: "input" },
  },
  {
    name: "Create Points",
    endpoint: "/api/points",
    method: "POST",
    fields: { amount: "input", streak: "input" },
  },
  {
    name: "Get Point",
    endpoint: "/api/point",
    method: "GET",
    fields: {},
  },
  {
    name: "Update Point",
    endpoint: "/api/point/:amount",
    method: "PATCH",
    fields: { amount: "input" },
  },
  {
    name: "Streak Update",
    endpoint: "/api/points/streak",
    method: "PATCH",
    fields: {},
  },
  {
    name: "Send Points",
    endpoint: "/api/point/requests/:to",
    method: "PATCH",
    fields: { to: "input", amount: "input" },
  },
  {
    name: "Update Profile",
    endpoint: "/api/profile",
    method: "PATCH",
    fields: { update: { name: "input", sex: "input", dob: "input" } },
  },
  {
    name: "Get Profile",
    endpoint: "/api/profile",
    method: "GET",
    fields: {},
  },
  {
    name: "Create Group",
    endpoint: "/api/groups",
    method: "POST",
    fields: { status: "input" },
  },
  {
    name: "Get your Groups",
    endpoint: "/api/group",
    method: "GET",
    fields: {},
  },
  {
    name: "Get all groups",
    endpoint: "/api/groups",
    method: "GET",
    fields: {},
  },
  {
    name: "Invite to group",
    endpoint: "/api/groups/:id/:invitee",
    method: "PATCH",
    fields: { id: "input", invitee: "input" },
  },
  {
    name: "Give Ownership",
    endpoint: "/api/groups/:id/:newOwner",
    method: "POST",
    fields: { id: "input", newOwner: "input" },
  },
  {
    name: "Change Privacy",
    endpoint: "/api/groups/:id",
    method: "POST",
    fields: { id: "input", privacy: "input" },
  },
  {
    name: "Create Topic",
    endpoint: "/api/discussions",
    method: "POST",
    fields: { title: "input", category: "input" },
  },
  {
    name: "Add posts",
    endpoint: "/api/discussions/:id/posts/:post",
    method: "PATCH",
    fields: { id: "input", post: "input" },
  },
  {
    name: "Change Archive",
    endpoint: "/api/discussions/:id/archive/:status",
    method: "PATCH",
    fields: { id: "input", status: "input" },
  },
  {
    name: "Get Spotlight",
    endpoint: "/api/spotlights",
    method: "GET",
    fields: {},
  },
  {
    name: "Get All Topics",
    endpoint: "/api/discussions",
    method: "GET",
    fields: {},
  },
  {
    name: "Delete User From Group",
    endpoint: "/api/groups/:_id/delete/:target",
    method: "POST",
    fields: { _id: "input", target: "input", reason: "input" },
  },
  {
    name: "Delete Group",
    endpoint: "/api/groups/:_id",
    method: "POST",
    fields: { _id: "input", reason: "input" },
  },
  {
    name: "Add censorword to Group",
    endpoint: "/api/groups/:_id/censoredwords",
    method: "POST",
    fields: { _id: "input", reason: "input", word: "input" },
  },
  {
    name: "Delete censorword to Group",
    endpoint: "/api/groups/:_id/uncensoredwords",
    method: "POST",
    fields: { _id: "input", reason: "input", word: "input" },
  },
  {
    name: "Check Vote Status",
    endpoint: "/api/groups/:_id/votes",
    method: "GET",
    fields: { _id: "input" },
  },
  {
    name: "Vote Yes",
    endpoint: "/api/votes/:id",
    method: "PATCH",
    fields: { id: "input" },
  },
  {
    name: "Create Component",
    endpoint: "/api/components",
    method: "POST",
    fields: { componentType: "input", width: "input", height: "input", fontSize: "input", font: "input", fontColor: "input", xPos: "input", yPos: "input" },
  },
  {
    name: "Update Component",
    endpoint: "/api/components/:componentType",
    method: "PATCH",
    fields: { componentType: "input", update: { width: "input", height: "input", fontSize: "input", font: "input", fontColor: "input", xPos: "input", yPos: "input" } },
  },
  {
    name: "Delete Component",
    endpoint: "/api/components/:componentType",
    method: "DELETE",
    fields: { componentType: "input" },
  },
  {
    name: "Get all Components",
    endpoint: "/api/components",
    method: "GET",
    fields: {},
  },
];

// Do not edit below here.
// If you are interested in how this works, feel free to ask on forum!

function updateResponse(code: string, response: string) {
  document.querySelector("#status-code")!.innerHTML = code;
  document.querySelector("#response-text")!.innerHTML = response;
}

async function request(method: HttpMethod, endpoint: string, params?: unknown) {
  try {
    if (method === "GET" && params) {
      endpoint += "?" + new URLSearchParams(params as Record<string, string>).toString();
      params = undefined;
    }

    const res = fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: params ? JSON.stringify(params) : undefined,
    });

    return {
      $statusCode: (await res).status,
      $response: await (await res).json(),
    };
  } catch (e) {
    console.log(e);
    return {
      $statusCode: "???",
      $response: { error: "Something went wrong, check your console log.", details: e },
    };
  }
}

function fieldsToHtml(fields: Record<string, Field>, indent = 0, prefix = ""): string {
  return Object.entries(fields)
    .map(([name, tag]) => {
      const htmlTag = tag === "json" ? "textarea" : tag;
      return `
        <div class="field" style="margin-left: ${indent}px">
          <label>${name}:
          ${typeof tag === "string" ? `<${htmlTag} name="${prefix}${name}"></${htmlTag}>` : fieldsToHtml(tag, indent + 10, prefix + name + ".")}
          </label>
        </div>`;
    })
    .join("");
}

function getHtmlOperations() {
  return operations.map((operation) => {
    return `<li class="operation">
      <h3>${operation.name}</h3>
      <form class="operation-form">
        <input type="hidden" name="$endpoint" value="${operation.endpoint}" />
        <input type="hidden" name="$method" value="${operation.method}" />
        ${fieldsToHtml(operation.fields)}
        <button type="submit">Submit</button>
      </form>
    </li>`;
  });
}

function prefixedRecordIntoObject(record: Record<string, string>) {
  const obj: any = {}; // eslint-disable-line
  for (const [key, value] of Object.entries(record)) {
    if (!value) {
      continue;
    }
    const keys = key.split(".");
    const lastKey = keys.pop()!;
    let currentObj = obj;
    for (const key of keys) {
      if (!currentObj[key]) {
        currentObj[key] = {};
      }
      currentObj = currentObj[key];
    }
    currentObj[lastKey] = value;
  }
  return obj;
}

async function submitEventHandler(e: Event) {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const { $method, $endpoint, ...reqData } = Object.fromEntries(new FormData(form));

  // Replace :param with the actual value.
  const endpoint = ($endpoint as string).replace(/:(\w+)/g, (_, key) => {
    const param = reqData[key] as string;
    delete reqData[key];
    return param;
  });

  const op = operations.find((op) => op.endpoint === $endpoint && op.method === $method);
  const pairs = Object.entries(reqData);
  for (const [key, val] of pairs) {
    if (val === "") {
      delete reqData[key];
      continue;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const type = key.split(".").reduce((obj, key) => obj[key], op?.fields as any);
    if (type === "json") {
      reqData[key] = JSON.parse(val as string);
    }
  }

  const data = prefixedRecordIntoObject(reqData as Record<string, string>);

  updateResponse("", "Loading...");
  const response = await request($method as HttpMethod, endpoint as string, Object.keys(data).length > 0 ? data : undefined);
  updateResponse(response.$statusCode.toString(), JSON.stringify(response.$response, null, 2));
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#operations-list")!.innerHTML = getHtmlOperations().join("");
  document.querySelectorAll(".operation-form").forEach((form) => form.addEventListener("submit", submitEventHandler));
});
