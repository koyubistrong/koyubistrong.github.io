#ifndef _FUTK_AGENT_TEST_HPP_
#define _FUTK_AGENT_TEST_HPP_

#include "Agent.hpp"
#include "MotionSequence.hpp"

namespace futk
{
	class AgentTest : public Agent
	{
	public:
		AgentTest(int argc, char* argv[]);
		virtual ~AgentTest();

	protected:
		virtual void Think() override;
		void MoveHeadByCode();
		void MoveHeadByXML();
		MotionSequence* motion_;
		int cycle;
	};
}

#endif
