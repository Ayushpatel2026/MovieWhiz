export type Input = FormInput | TextInput | AudioInput;

export type FormInput = {
  type: "form";
  data: {
    genre?: string[];
    director?: string;
    year?: number;
    actors?: string[];
    characters?: string[];
    setting?: string;
  };
};

export type TextInput = {
  type: "text";
  data: string;
};

export type AudioInput = {
  type: "audio";
  data: Express.Multer.File;
};
