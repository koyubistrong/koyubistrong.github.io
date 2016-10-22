#include "AgentTest.hpp"
#include "JointController.hpp"
#include "MotionSequenceXML.hpp"
#include "const.hpp"

using namespace futk;
using namespace Eigen;
using namespace std;

AgentTest::AgentTest(int argc, char* argv[]) : Agent(argc, argv)
{
	//motion_ = new MotionSequenceXML("xml/MotionXML/ShakingHead.xml");
	cycle = 0;
}

AgentTest::~AgentTest()
{
	SAFE_DELETE(motion_)
}

void AgentTest::Think()
{

}

void AgentTest::MoveHeadByCode()
{

}

void AgentTest::MoveHeadByXML()
{

}
