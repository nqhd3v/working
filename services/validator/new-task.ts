import {
  TBlpTaskProcessPhase,
  TBlpUserRole,
  TInitTaskInfo,
  TInitTaskPayload,
} from "@nqhd3v/crazy/types/blueprint";
import Joi from "joi";

const validateNewTaskPayload = Joi.object({
  // for phase
  project: Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
  }).required(),
  category: Joi.object({
    coCd: Joi.string().required(),
    mgrId: Joi.string().required(),
    mode: Joi.number().required(),
    ordNo: Joi.number().required(),
    pjtId: Joi.string().required(),
    pjtNm: Joi.string().required(),
    pjtTpCd: Joi.string().required(),
    prntPjtId: Joi.string().required(),
    rootPjtId: Joi.string().required(),
  })
    .required()
    .unknown(true),
  jobType: Joi.object({
    code: Joi.string().required(),
    name: Joi.string().required(),
  }).required(),
  process: Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
  }).required(),
  iterationId: Joi.string().required(),
  phasesWithAssigner: Joi.object().pattern(
    Joi.string(),
    Joi.object({
      usrId: Joi.string().required(),
      usrNm: Joi.string().required(),
    }).unknown(true)
  ),
  // for task
  title: Joi.string().required(),
  description: Joi.string().required(),
  descriptionHTML: Joi.string().required(),
});

const isValidatedNewTaskPayload = async (
  data: TInitTaskPayload &
    TInitTaskInfo & {
      phasesWithAssigner: Record<TBlpTaskProcessPhase["phsCd"], TBlpUserRole>;
    }
): Promise<boolean> => {
  try {
    const validate = await validateNewTaskPayload.validateAsync(data);
    console.error(validate.error);
    return !validate.error;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export default isValidatedNewTaskPayload;
