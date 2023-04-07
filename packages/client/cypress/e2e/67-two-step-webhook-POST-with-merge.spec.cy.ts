/* eslint-disable jest/valid-expect */
/* eslint-disable jest/valid-describe-callback */
/* eslint-disable @typescript-eslint/no-shadow */
import credentials from "../fixtures/credentials";
import { loginFunc } from "../test-helpers/loginFunc";
import setupWebhookTemplates from "../test-helpers/setupWebhookTemplates";
import startWebhookJouney from "../test-helpers/startWebhookJouney";

const { email, password, emailTemplate, userAPIkey } =
  credentials.MessageHitUser;

describe(
  "Journey with webhook triggered",
  { env: { AxiosURL: "http://localhost:3001/" } },
  () => {
    beforeEach(() => {
      cy.request("http://localhost:3001/tests/reset-tests");
      cy.wait(1000);
    });

    it("passes for POST and merge tags", () => {
      loginFunc(email, password);
      setupWebhookTemplates();

      startWebhookJouney("webhook2");

      cy.wait(5000);
      cy.reload();
      cy.get(".justify-between > :nth-child(1) > .font-medium").then((el) => {
        expect(Number(el.text())).greaterThan(0);
      });

      // cy.request({
      //   method: "POST",
      //   url: `${Cypress.env("AxiosURL")}events`,
      //   headers: {
      //     Authorization: `Api-Key ${userAPIkey}`,
      //   },
      //   body: {
      //     correlationKey: "email",
      //     correlationValue: emailTemplate.correlationValue,
      //     event: { wh: "wh" },
      //   },
      // }).then(({ body }) => {
      //   const webhookBody = JSON.parse(body[0]?.allJobData?.[0]?.body);
      //   expect(webhookBody?.userId).to.eq("testmail@gmail.com");
      //   expect(webhookBody?.templatesExample).to.eq(
      //     "How was your recent experience?"
      //   );

      //   cy.wait(5000);
      //   cy.request({
      //     method: "POST",
      //     headers: {
      //       Authorization: `Api-Key ${userAPIkey}`,
      //     },
      //     url: `${Cypress.env("AxiosURL")}events/job-status/webhook`,
      //     body: {
      //       jobId: body[0]?.jobIds?.[0],
      //     },
      //   }).then(({ body }) => {
      //     expect(body).to.equal("completed");
      //   });
      // });
    });
  }
);
