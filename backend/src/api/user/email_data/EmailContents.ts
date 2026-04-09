export enum EmailContents {
  DEL_OBJ = 'Account Deletion',
  DEL_MSG = 'The account associated with this email address has been deleted',
  VER_OBJ = 'Email Verification',
  VER_MSG = `<p>Please click on the link below in order to verify your email address:</p><p><a title="Card Nest Email Verification "href="URL">Click here</a></p>`,
  VER_SUCCESS_OBJ = 'Email Verified',
  VER_SUCCESS_MESSAGE = `<p>Your email address has been successfully verified.</p><p><a title="Card Nest Home" href="URL">Card Nest Home Page</a></p>`,
  EXP_DEL_OBJ = 'Account Deleted',
  EXP_DEL_MSG = 'The account linked to this email address has been deleted as it was not verified within the time limit.',
}
