const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export type UploadKind = "resume" | "certificate";

type FileRule = {
  extensions: readonly string[];
  mimeTypes: readonly string[];
  signature: (bytes: Uint8Array) => boolean;
};

const startsWith = (bytes: Uint8Array, signature: readonly number[]) =>
  signature.every((value, index) => bytes[index] === value);

const containsAscii = (bytes: Uint8Array, value: string) => {
  const needle = new TextEncoder().encode(value);
  outer: for (let index = 0; index <= bytes.length - needle.length; index += 1) {
    for (let offset = 0; offset < needle.length; offset += 1) {
      if (bytes[index + offset] !== needle[offset]) continue outer;
    }
    return true;
  }
  return false;
};

const rules: Record<string, FileRule> = {
  pdf: {
    extensions: ["pdf"],
    mimeTypes: ["application/pdf"],
    signature: (bytes) => startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d]),
  },
  docx: {
    extensions: ["docx"],
    mimeTypes: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    signature: (bytes) =>
      startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]) &&
      containsAscii(bytes, "[Content_Types].xml") &&
      containsAscii(bytes, "word/"),
  },
  jpeg: {
    extensions: ["jpg", "jpeg"],
    mimeTypes: ["image/jpeg"],
    signature: (bytes) => startsWith(bytes, [0xff, 0xd8, 0xff]),
  },
  png: {
    extensions: ["png"],
    mimeTypes: ["image/png"],
    signature: (bytes) => startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  },
};

const allowedRuleNames: Record<UploadKind, readonly string[]> = {
  resume: ["pdf", "docx"],
  certificate: ["pdf", "jpeg", "png"],
};

export type UploadValidation =
  | { valid: true; extension: string; contentType: string }
  | { valid: false; error: string };

export async function validateUpload(file: File, kind: UploadKind): Promise<UploadValidation> {
  if (file.size === 0) return { valid: false, error: "The selected file is empty." };
  if (file.size > MAX_UPLOAD_BYTES) return { valid: false, error: "File must be 5 MB or smaller." };

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const rule = allowedRuleNames[kind]
    .map((name) => rules[name])
    .find((candidate) => candidate.extensions.includes(extension));

  if (!rule) {
    return {
      valid: false,
      error: kind === "resume" ? "Only PDF and DOCX files are supported." : "Only PDF, JPG, JPEG and PNG files are supported.",
    };
  }
  if (!rule.mimeTypes.includes(file.type.toLowerCase())) {
    return { valid: false, error: "The file type does not match its extension." };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!rule.signature(bytes)) {
    return { valid: false, error: "The file contents do not match the selected file type." };
  }

  return { valid: true, extension, contentType: rule.mimeTypes[0] };
}

export function safeUploadFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120);
}
