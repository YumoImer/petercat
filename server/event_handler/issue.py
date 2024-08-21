from typing import Any
from github import Github, Auth
from github import GithubException

from dao.repositoryConfigDAO import RepositoryConfigDAO
from petercat_utils.data_class import ChatData, Message, TextContentBlock

from agent.qa_chat import agent_chat


class IssueEventHandler:
    event: Any
    auth: Auth.AppAuth
    g: Github

    def __init__(self, payload: Any, auth: Auth.AppAuth, installation_id: int) -> None:
        self.event: Any = payload
        self.auth: Auth.AppAuth = auth
        self.g: Github = Github(auth=auth)

    async def execute(self):
        repository_config = RepositoryConfigDAO()
        try:
            print("actions:", self.event["action"])
            if self.event["action"] == "opened":
                repo_name = self.event["repository"]["full_name"]
                issue_number = self.event["issue"]["number"]
                repo = self.g.get_repo(repo_name)
                issue = repo.get_issue(number=issue_number)
                issue_content = f"{issue.title}: {issue.body}"
                text_block = TextContentBlock(type="text", text=issue_content)
                issue_content = issue.body
                message = Message(role="user", content=[text_block])

                repo_config = repository_config.get_by_repo_name(repo_name)
                analysis_result = await agent_chat(ChatData(messages=[message], bot_id=repo_config.robot_id), None)
                issue.create_comment(analysis_result["output"])

                return {"success": True}
        except GithubException as e:
            print(f"处理 GitHub 请求时出错：{e}")
            return {"success": False, "error": str(e)}
